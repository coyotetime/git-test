import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng, RouteStop, ScenicRoute } from '@/constants/routes';
import {
  SCENIC_WAYPOINTS,
  ScenicWaypoint,
} from '@/constants/waypoints';
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

function matchesDurationBand(
  waypoint: ScenicWaypoint,
  durationId: DurationOption['id'],
): boolean {
  const distance = waypoint.approximateDistanceFromVictoria;

  switch (durationId) {
    case '30':
      return distance <= 10;
    case '60':
      return distance > 8 && distance <= 16;
    case '90':
      return distance >= 14;
    default:
      return true;
  }
}

function pickWaypoint(
  durationId: DurationOption['id'],
  vibeId: VibeOption['id'] | null,
): ScenicWaypoint {
  const effectiveVibe = vibeId ?? 'surprise';
  const inBand = SCENIC_WAYPOINTS.filter((waypoint) =>
    matchesDurationBand(waypoint, durationId),
  );

  const vibeMatched =
    effectiveVibe === 'surprise'
      ? inBand
      : inBand.filter((waypoint) => waypoint.vibes.includes(effectiveVibe));

  const pool =
    vibeMatched.length > 0
      ? vibeMatched
      : inBand.length > 0
        ? inBand
        : SCENIC_WAYPOINTS;

  if (effectiveVibe === 'surprise') {
    return pool[Math.floor(Math.random() * pool.length)] ?? SCENIC_WAYPOINTS[0];
  }

  return pool[0] ?? SCENIC_WAYPOINTS[0];
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
 */
export async function generateScenicDrive(
  input: GenerateDriveInput,
): Promise<GeneratedDrive> {
  const waypoint = pickWaypoint(input.durationId, input.vibeId);
  const stops = buildStops(input.origin, input.originLabel, waypoint);
  const routed = await fetchDrivingRoute(stops.map((stop) => stop.coordinate));

  const durationMinutes = Math.max(1, Math.round(routed.durationSeconds / 60));
  const distanceKm = Math.max(0.1, Math.round(routed.distanceMeters / 100) / 10);

  return {
    id: `${waypoint.id}-${input.durationId}`,
    name: waypoint.name,
    description: waypoint.shortDescription,
    vibeIds:
      input.vibeId && input.vibeId !== 'surprise'
        ? [input.vibeId]
        : waypoint.vibes.slice(0, 3),
    durationMinutes,
    distanceKm,
    stops,
    polyline: routed.geometry,
    waypoint,
  };
}
