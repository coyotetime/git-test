/**
 * Live discovery smoke test (Vancouver Island).
 * Usage: npx tsx scripts/run-discovery-test.ts
 */

(globalThis as { __DEV__?: boolean }).__DEV__ = true;

import { discoverNearbyDrive } from '../services/routeDiscovery';

const ORIGINS = [
  {
    label: 'Parksville, BC',
    origin: { latitude: 49.319, longitude: -124.3157 },
  },
  {
    label: 'Nanaimo, BC',
    origin: { latitude: 49.1659, longitude: -123.9401 },
  },
] as const;

async function runOne(
  label: string,
  origin: { latitude: number; longitude: number },
) {
  console.log(`\n========== ${label} / 30 min / coast ==========`);
  const result = await discoverNearbyDrive({
    origin,
    originLabel: label,
    durationId: '30',
    vibeId: 'coast',
  });

  console.log(result.debug.summaryText);
  console.log('STATUS', result.status);
  if (result.status === 'ok') {
    console.log('DRIVE', {
      name: result.drive.name,
      durationMinutes: result.drive.durationMinutes,
      distanceKm: result.drive.distanceKm,
      stops: result.drive.stops.map((s) => s.name),
      fallback: result.debug.usedBearingFallback,
    });
  } else {
    console.log('REASON', result.reason);
    console.log('MESSAGE', result.message);
  }
  return result;
}

async function main() {
  const outcomes = [];
  for (const sample of ORIGINS) {
    try {
      const result = await runOne(sample.label, sample.origin);
      outcomes.push({
        label: sample.label,
        status: result.status,
        best: result.debug.bestRouteName,
        valid: result.debug.validRoutes,
        osm: result.debug.osmRawResults,
        fallback: result.debug.usedBearingFallback,
        overpassError: result.debug.overpassError,
      });
    } catch (error) {
      console.error('FATAL', sample.label, error);
      outcomes.push({
        label: sample.label,
        status: 'fatal',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log('\n========== OUTCOMES ==========');
  console.log(JSON.stringify(outcomes, null, 2));

  const anyOk = outcomes.some((item) => item.status === 'ok');
  if (!anyOk) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
