import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng, RouteStop, ScenicRoute } from '@/constants/routes';
import {
  SCENIC_WAYPOINTS,
  ScenicWaypoint,
} from '@/constants/waypoints';
import { distanceKm } from '@/services/geo';
import { fetchDrivingRoute } from '@/services/routing';

export type GenerateDriveInput = {
  origin: LatLng;
  originLabel: string;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
};

export type GeneratedDrive = ScenicRoute & {
  polyline: LatLng[];
  waypoint: ScenicWaypoint;
};

type DistanceBand = {
  minKm: number;
  maxKm: number;
  targetKm: number;
};

function getDistanceBand(durationId: DurationOption['id']): DistanceBand {
  switch (durationId) {
    case '30':
      // Nearby out-and-back from the user's current position.
      return { minKm: 2, maxKm: 10, targetKm: 5 };
    case '60':
      return { minKm: 8, maxKm: 16, targetKm: 12 };
    case '90':
      return { minKm: 14, maxKm: 35, targetKm: 20 };
    default:
      return { minKm: 2, maxKm: 35, targetKm: 10 };
  }
}

type RankedWaypoint = {
  waypoint: ScenicWaypoint;
  distanceFromOriginKm: number;
};

function rankWaypoints(origin: LatLng): RankedWaypoint[] {
  return SCENIC_WAYPOINTS.map((waypoint) => ({
    waypoint,
    distanceFromOriginKm: distanceKm(origin, waypoint.coordinate),
  })).sort((a, b) => a.distanceFromOriginKm - b.distanceFromOriginKm);
}

function pickWaypoint(
  origin: LatLng,
  durationId: DurationOption['id'],
  vibeId: VibeOption['id'] | null,
): ScenicWaypoint {
  const effectiveVibe = vibeId ?? 'surprise';
  const band = getDistanceBand(durationId);
  const ranked = rankWaypoints(origin);

  const inBand = ranked.filter(
    (entry) =>
      entry.distanceFromOriginKm >= band.minKm &&
      entry.distanceFromOriginKm <= band.maxKm,
  );

  const vibeMatched =
    effectiveVibe === 'surprise'
      ? inBand
      : inBand.filter((entry) => entry.waypoint.vibes.includes(effectiveVibe));

  // If the band is empty (e.g. user is far from the curated set), widen the search.
  const pool =
    vibeMatched.length > 0
      ? vibeMatched
      : inBand.length > 0
        ? inBand
        : effectiveVibe === 'surprise'
          ? ranked
          : ranked.filter((entry) =>
              entry.waypoint.vibes.includes(effectiveVibe),
            );

  const candidates = pool.length > 0 ? pool : ranked;

  if (effectiveVibe === 'surprise') {
    return (
      candidates[Math.floor(Math.random() * candidates.length)]?.waypoint ??
      SCENIC_WAYPOINTS[0]
    );
  }

  // Prefer the waypoint closest to the target one-way distance for this duration.
  const best = [...candidates].sort(
    (a, b) =>
      Math.abs(a.distanceFromOriginKm - band.targetKm) -
      Math.abs(b.distanceFromOriginKm - band.targetKm),
  )[0];

  return best?.waypoint ?? SCENIC_WAYPOINTS[0];
}

function buildStops(
  origin: LatLng,
  originLabel: string,
  waypoint: ScenicWaypoint,
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

/**
 * Builds a simple out-and-back scenic drive:
 * current location → curated waypoint → current location.
 *
 * Waypoint choice is based on distance from the user's origin (not downtown Victoria).
 */
export async function generateScenicDrive(
  input: GenerateDriveInput,
): Promise<GeneratedDrive> {
  const waypoint = pickWaypoint(input.origin, input.durationId, input.vibeId);
  const stops = buildStops(input.origin, input.originLabel, waypoint);
  const routed = await fetchDrivingRoute(stops.map((stop) => stop.coordinate));

  const durationMinutes = Math.max(1, Math.round(routed.durationSeconds / 60));
  const distanceKmValue = Math.max(
    0.1,
    Math.round(routed.distanceMeters / 100) / 10,
  );

  return {
    id: `${waypoint.id}-${input.durationId}`,
    name: waypoint.name,
    description: waypoint.shortDescription,
    vibeIds:
      input.vibeId && input.vibeId !== 'surprise'
        ? [input.vibeId]
        : waypoint.vibes.slice(0, 3),
    durationMinutes,
    distanceKm: distanceKmValue,
    stops,
    polyline: routed.geometry,
    waypoint,
  };
}
