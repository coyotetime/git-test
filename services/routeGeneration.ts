import { ScenicDestination } from '@/constants/destinations';
import { getDurationWindow } from '@/constants/duration';
import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng, RouteStop, ScenicRoute } from '@/constants/routes';
import { SCENIC_WAYPOINTS } from '@/constants/waypoints';
import { distanceKm } from '@/services/geo';
import { DrivingRouteResult, fetchDrivingRoute } from '@/services/routing';

export type GenerateDriveInput = {
  origin: LatLng;
  originLabel: string;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
};

export type GeneratedDrive = ScenicRoute & {
  polyline: LatLng[];
  waypoint: ScenicDestination;
};

export type GenerateDriveResult =
  | { status: 'ok'; drive: GeneratedDrive }
  | { status: 'none' };

type CandidateEvaluation = {
  waypoint: ScenicDestination;
  straightLineKm: number;
  routed: DrivingRouteResult;
  durationMinutes: number;
};

function buildStops(
  origin: LatLng,
  originLabel: string,
  waypoint: ScenicDestination,
): RouteStop[] {
  return [
    {
      id: 'start',
      name: originLabel,
      coordinate: origin,
    },
    {
      id: waypoint.id,
      name: waypoint.name,
      coordinate: waypoint.coordinate,
    },
    {
      id: 'return',
      name: `Back toward ${originLabel}`,
      coordinate: origin,
    },
  ];
}

function matchesSelectedVibe(
  waypoint: ScenicDestination,
  vibeId: VibeOption['id'] | null,
): boolean {
  if (!vibeId || vibeId === 'surprise') {
    return true;
  }
  return waypoint.vibes.includes(vibeId);
}

/**
 * Builds a scenic out-and-back drive from curated destinations near the user.
 *
 * Selected duration is a hard constraint. Faraway curated destinations
 * are never returned.
 */
export async function generateScenicDrive(
  input: GenerateDriveInput,
): Promise<GenerateDriveResult> {
  const window = getDurationWindow(input.durationId);
  const effectiveVibe = input.vibeId ?? 'surprise';

  console.log('[Scenic routing] origin', input.origin);
  console.log('[Scenic routing] selected duration', input.durationId, window);
  console.log('[Scenic routing] selected vibe', effectiveVibe);
  console.log(
    '[Scenic routing] candidates before distance filter',
    SCENIC_WAYPOINTS.length,
  );

  const distanceFiltered = SCENIC_WAYPOINTS.map((waypoint) => ({
    waypoint,
    straightLineKm: distanceKm(input.origin, waypoint.coordinate),
  })).filter((entry) => entry.straightLineKm <= window.maxStraightLineKm);

  console.log(
    '[Scenic routing] candidates after distance filter',
    distanceFiltered.length,
    distanceFiltered.map(
      (entry) => `${entry.waypoint.id}:${entry.straightLineKm.toFixed(1)}km`,
    ),
  );

  const vibeFiltered =
    effectiveVibe === 'surprise'
      ? distanceFiltered
      : distanceFiltered.filter((entry) =>
          matchesSelectedVibe(entry.waypoint, effectiveVibe),
        );

  if (vibeFiltered.length === 0) {
    console.log(
      '[Scenic routing] no candidates after vibe/distance filters — none',
    );
    return { status: 'none' };
  }

  const evaluations: CandidateEvaluation[] = [];

  for (const candidate of vibeFiltered) {
    try {
      const stops = buildStops(
        input.origin,
        input.originLabel,
        candidate.waypoint,
      );
      const routed = await fetchDrivingRoute(
        stops.map((stop) => stop.coordinate),
      );
      const durationMinutes = routed.durationSeconds / 60;

      console.log(
        '[Scenic routing] OSRM candidate',
        candidate.waypoint.id,
        `${durationMinutes.toFixed(1)} min`,
        `${(routed.distanceMeters / 1000).toFixed(1)} km`,
      );

      if (
        durationMinutes >= window.minMinutes &&
        durationMinutes <= window.maxMinutes
      ) {
        evaluations.push({
          waypoint: candidate.waypoint,
          straightLineKm: candidate.straightLineKm,
          routed,
          durationMinutes,
        });
      } else {
        console.log(
          '[Scenic routing] discarded outside duration window',
          candidate.waypoint.id,
          `${durationMinutes.toFixed(1)} min`,
        );
      }
    } catch (error) {
      console.log(
        '[Scenic routing] OSRM failed for',
        candidate.waypoint.id,
        error,
      );
    }
  }

  if (evaluations.length === 0) {
    console.log('[Scenic routing] no duration-valid candidates — none');
    return { status: 'none' };
  }

  evaluations.sort((a, b) => {
    const durationDelta =
      Math.abs(a.durationMinutes - window.targetMinutes) -
      Math.abs(b.durationMinutes - window.targetMinutes);
    if (durationDelta !== 0) {
      return durationDelta;
    }
    return a.straightLineKm - b.straightLineKm;
  });

  const bestDelta = Math.abs(
    evaluations[0].durationMinutes - window.targetMinutes,
  );
  const nearBest = evaluations.filter(
    (entry) =>
      Math.abs(entry.durationMinutes - window.targetMinutes) <= bestDelta + 2,
  );
  const chosen =
    effectiveVibe === 'surprise'
      ? nearBest[Math.floor(Math.random() * nearBest.length)] ?? evaluations[0]
      : evaluations[0];

  console.log(
    '[Scenic routing] chosen route',
    chosen.waypoint.id,
    `${chosen.durationMinutes.toFixed(1)} min`,
    `${chosen.straightLineKm.toFixed(1)} km away`,
  );

  const stops = buildStops(input.origin, input.originLabel, chosen.waypoint);

  return {
    status: 'ok',
    drive: {
      id: `${chosen.waypoint.id}-${input.durationId}`,
      name: chosen.waypoint.name,
      description: chosen.waypoint.shortDescription,
      vibeIds:
        effectiveVibe !== 'surprise'
          ? [effectiveVibe]
          : chosen.waypoint.vibes.slice(0, 3),
      durationMinutes: Math.max(1, Math.round(chosen.durationMinutes)),
      distanceKm: Math.max(
        0.1,
        Math.round(chosen.routed.distanceMeters / 100) / 10,
      ),
      stops,
      polyline: chosen.routed.geometry,
      waypoint: chosen.waypoint,
    },
  };
}
