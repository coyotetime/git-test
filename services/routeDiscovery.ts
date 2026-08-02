import { getDurationWindow } from '@/constants/duration';
import {
  DestinationCategory,
  ScenicDestination,
} from '@/constants/destinations';
import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng, RouteStop } from '@/constants/routes';
import { distanceKm } from '@/services/geo';
import { fetchNearbyScenicPlaces } from '@/services/places';
import { GeneratedDrive } from '@/services/routeGeneration';
import { titleForDestination } from '@/services/routeTitles';
import { DrivingRouteResult, fetchDrivingRoute } from '@/services/routing';

/**
 * Nearby drive discovery for areas without curated Scenic waypoints.
 *
 * Uses public Overpass (places) + public OSRM (routing). Both should be
 * replaced or properly hosted before production release.
 */

export type DiscoverNearbyDriveInput = {
  origin: LatLng;
  originLabel: string;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
};

export type DiscoverNearbyDriveResult =
  | { status: 'ok'; drive: GeneratedDrive }
  | { status: 'none' };

type RankedCandidate = {
  destination: ScenicDestination;
  straightLineKm: number;
  routed: DrivingRouteResult;
  durationMinutes: number;
  score: number;
};

const MAX_OSRM_CANDIDATES = 10;

function buildStops(
  origin: LatLng,
  originLabel: string,
  destination: ScenicDestination,
): RouteStop[] {
  return [
    {
      id: 'start',
      name: originLabel,
      coordinate: origin,
    },
    {
      id: destination.id,
      name: destination.name,
      coordinate: destination.coordinate,
    },
    {
      id: 'return',
      name: `Back toward ${originLabel}`,
      coordinate: origin,
    },
  ];
}

function categoryScore(category: DestinationCategory): number {
  switch (category) {
    case 'viewpoint':
      return 4;
    case 'beach':
      return 4;
    case 'nature_reserve':
      return 3.5;
    case 'lake':
      return 3;
    case 'park':
      return 2.5;
    case 'picnic_site':
      return 2;
    case 'attraction':
      return 2;
    case 'cafe':
      return 1.5;
    default:
      return 1;
  }
}

function vibeScore(
  destination: ScenicDestination,
  vibeId: VibeOption['id'] | null,
): number {
  if (!vibeId || vibeId === 'surprise') {
    return 1;
  }
  return destination.vibes.includes(vibeId) ? 5 : 0;
}

function prelimScore(
  destination: ScenicDestination,
  origin: LatLng,
  vibeId: VibeOption['id'] | null,
  targetKm: number,
): number {
  const km = distanceKm(origin, destination.coordinate);
  const proximity = Math.max(0, 4 - Math.abs(km - targetKm) / 4);
  return vibeScore(destination, vibeId) * 2 + categoryScore(destination.category) + proximity;
}

function finalScore(
  candidate: Omit<RankedCandidate, 'score'>,
  targetMinutes: number,
  vibeId: VibeOption['id'] | null,
): number {
  const durationCloseness =
    8 - Math.abs(candidate.durationMinutes - targetMinutes) / 3;
  const variety = (candidate.destination.id.charCodeAt(candidate.destination.id.length - 1) % 5) * 0.15;

  return (
    durationCloseness * 3 +
    vibeScore(candidate.destination, vibeId) * 2 +
    categoryScore(candidate.destination.category) +
    Math.max(0, 3 - candidate.straightLineKm / 8) +
    variety
  );
}

export async function discoverNearbyDrive(
  input: DiscoverNearbyDriveInput,
): Promise<DiscoverNearbyDriveResult> {
  const window = getDurationWindow(input.durationId);
  const effectiveVibe = input.vibeId ?? 'surprise';

  console.log('[Scenic discovery] start', {
    origin: input.origin,
    durationId: input.durationId,
    vibeId: effectiveVibe,
  });

  const places = await fetchNearbyScenicPlaces({
    origin: input.origin,
    durationId: input.durationId,
    vibeId: effectiveVibe,
  });

  const vibePreferred =
    effectiveVibe === 'surprise'
      ? places
      : places.filter((place) => place.vibes.includes(effectiveVibe));

  // Keep vibe preferred when possible; otherwise still evaluate scenic places in range
  // so Coast/Views can succeed from OSM tags that didn't infer perfectly.
  const pool = vibePreferred.length > 0 ? vibePreferred : places;

  const targetOneWayKm = window.maxStraightLineKm * 0.45;
  const shortlist = [...pool]
    .sort(
      (a, b) =>
        prelimScore(b, input.origin, effectiveVibe, targetOneWayKm) -
        prelimScore(a, input.origin, effectiveVibe, targetOneWayKm),
    )
    .slice(0, MAX_OSRM_CANDIDATES);

  console.log(
    '[Scenic discovery] shortlist',
    shortlist.map((place) => place.name),
  );

  const valid: RankedCandidate[] = [];

  for (const destination of shortlist) {
    try {
      const stops = buildStops(input.origin, input.originLabel, destination);
      const routed = await fetchDrivingRoute(
        stops.map((stop) => stop.coordinate),
      );
      const durationMinutes = routed.durationSeconds / 60;
      const straightLineKm = distanceKm(input.origin, destination.coordinate);

      console.log(
        '[Scenic discovery] OSRM',
        destination.name,
        `${durationMinutes.toFixed(1)} min`,
      );

      if (
        durationMinutes < window.minMinutes ||
        durationMinutes > window.maxMinutes
      ) {
        continue;
      }

      // If a specific vibe was chosen, require a vibe match among duration-valid routes.
      if (
        effectiveVibe !== 'surprise' &&
        !destination.vibes.includes(effectiveVibe)
      ) {
        continue;
      }

      const base = {
        destination,
        straightLineKm,
        routed,
        durationMinutes,
      };

      valid.push({
        ...base,
        score: finalScore(base, window.targetMinutes, effectiveVibe),
      });
    } catch (error) {
      console.log('[Scenic discovery] OSRM failed', destination.name, error);
    }
  }

  if (valid.length === 0) {
    console.log('[Scenic discovery] no valid nearby routes');
    return { status: 'none' };
  }

  valid.sort((a, b) => b.score - a.score);
  const chosen = valid[0];

  console.log('[Scenic discovery] chosen', {
    name: chosen.destination.name,
    durationMinutes: chosen.durationMinutes,
    score: chosen.score,
  });

  const title = titleForDestination(
    chosen.destination.name,
    chosen.destination.category,
    effectiveVibe,
  );

  return {
    status: 'ok',
    drive: {
      id: `${chosen.destination.id}-${input.durationId}`,
      name: title,
      description: chosen.destination.shortDescription,
      vibeIds:
        effectiveVibe !== 'surprise'
          ? [effectiveVibe]
          : chosen.destination.vibes.slice(0, 3),
      durationMinutes: Math.max(1, Math.round(chosen.durationMinutes)),
      distanceKm: Math.max(
        0.1,
        Math.round(chosen.routed.distanceMeters / 100) / 10,
      ),
      stops: buildStops(input.origin, input.originLabel, chosen.destination),
      polyline: chosen.routed.geometry,
      waypoint: chosen.destination,
    },
  };
}
