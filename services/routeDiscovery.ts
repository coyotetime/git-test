import { getDiscoveryDurationWindow } from '@/constants/duration';
import {
  DestinationCategory,
  ScenicDestination,
} from '@/constants/destinations';
import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng, RouteStop } from '@/constants/routes';
import { distanceKm, pointAtBearing } from '@/services/geo';
import {
  fetchNearbyScenicPlaces,
  PlacesFetchDebug,
} from '@/services/places';
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

export type DiscoveryFailureReason =
  | 'no_places'
  | 'no_fitting_route'
  | 'routing_unreachable'
  | 'overpass_error'
  | 'invalid_origin';

export type CandidateDebugEntry = {
  name: string;
  straightLineKm: number;
  osrmDurationMinutes: number | null;
  accepted: boolean;
  rejectionReason: string | null;
  source: 'overpass' | 'bearing-fallback';
};

export type DiscoveryDebugSummary = {
  origin: LatLng;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
  searchRadiusMeters: number;
  osmRawResults: number;
  normalizedCount: number;
  afterDedupeCount: number;
  afterGeoFilterCount: number;
  candidatesConsidered: number;
  osrmTested: number;
  validRoutes: number;
  usedBearingFallback: boolean;
  overpassError: string | null;
  routingError: string | null;
  bestRouteName: string | null;
  bestRouteDurationMinutes: number | null;
  candidates: CandidateDebugEntry[];
  summaryText: string;
};

export type DiscoverNearbyDriveResult =
  | { status: 'ok'; drive: GeneratedDrive; debug: DiscoveryDebugSummary }
  | {
      status: 'none';
      reason: DiscoveryFailureReason;
      message: string;
      debug: DiscoveryDebugSummary;
    };

type RankedCandidate = {
  destination: ScenicDestination;
  straightLineKm: number;
  routed: DrivingRouteResult;
  durationMinutes: number;
  score: number;
  source: 'overpass' | 'bearing-fallback';
};

const MAX_OSRM_CANDIDATES = 30;

/**
 * TEMPORARY DEV FALLBACK — remove once Overpass coverage is trusted.
 * Generates synthetic points at fixed bearings when OSM returns nothing usable.
 */
const ENABLE_BEARING_FALLBACK = true;
const BEARING_DEGREES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

function bearingDistanceKm(durationId: DurationOption['id']): number {
  switch (durationId) {
    case '60':
      return 14;
    case '90':
      return 20;
    case '30':
    default:
      return 8;
  }
}

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
    case 'peak':
      return 4;
    case 'beach':
    case 'bay':
      return 4;
    case 'nature_reserve':
    case 'protected_area':
      return 3.5;
    case 'lake':
      return 3;
    case 'park':
      return 2.5;
    case 'picnic_site':
      return 2;
    case 'attraction':
      return 2;
    case 'locality':
      return 1.5;
    case 'cafe':
      return 1.5;
    default:
      return 1;
  }
}

/** Soft vibe ranking — never a hard reject. */
function vibeScore(
  destination: ScenicDestination,
  vibeId: VibeOption['id'] | null,
): number {
  if (!vibeId || vibeId === 'surprise') {
    return 1;
  }
  // Exact vibe match ranks higher; scenic near-misses stay eligible.
  return destination.vibes.includes(vibeId) ? 4 : 0.75;
}

function prelimScore(
  destination: ScenicDestination,
  origin: LatLng,
  vibeId: VibeOption['id'] | null,
  targetKm: number,
): number {
  const km = distanceKm(origin, destination.coordinate);
  const proximity = Math.max(0, 4 - Math.abs(km - targetKm) / 4);
  return (
    vibeScore(destination, vibeId) * 2 +
    categoryScore(destination.category) +
    proximity
  );
}

function finalScore(
  candidate: Omit<RankedCandidate, 'score'>,
  targetMinutes: number,
  vibeId: VibeOption['id'] | null,
): number {
  const durationCloseness =
    10 - Math.abs(candidate.durationMinutes - targetMinutes) / 2.5;
  const variety =
    (candidate.destination.id.charCodeAt(
      candidate.destination.id.length - 1,
    ) %
      5) *
    0.15;
  const fallbackPenalty = candidate.source === 'bearing-fallback' ? -4 : 0;

  return (
    durationCloseness * 4 +
    vibeScore(candidate.destination, vibeId) * 1.5 +
    categoryScore(candidate.destination.category) +
    Math.max(0, 3 - candidate.straightLineKm / 10) +
    variety +
    fallbackPenalty
  );
}

function createBearingFallbackCandidates(
  origin: LatLng,
  durationId: DurationOption['id'],
): ScenicDestination[] {
  const distance = bearingDistanceKm(durationId);

  return BEARING_DEGREES.map((bearing) => {
    const coordinate = pointAtBearing(origin, bearing, distance);
    const name = `Bearing ${bearing}° (~${distance} km)`;
    return {
      id: `bearing-fallback-${bearing}`,
      name,
      coordinate,
      category: 'scenic' as const,
      vibes: ['views'],
      shortDescription: `Temporary geographic probe at ${bearing}° for routing diagnostics.`,
      source: 'overpass' as const,
    };
  });
}

function formatSummary(debug: Omit<DiscoveryDebugSummary, 'summaryText'>): string {
  const lines = [
    'ROUTE DISCOVERY SUMMARY',
    `Origin: ${debug.origin.latitude.toFixed(5)}, ${debug.origin.longitude.toFixed(5)}`,
    `Duration: ${debug.durationId}  Vibe: ${debug.vibeId ?? 'surprise'}`,
    `Overpass radius: ${debug.searchRadiusMeters} m`,
    `OSM results: ${debug.osmRawResults}`,
    `Normalized: ${debug.normalizedCount}`,
    `After dedupe: ${debug.afterDedupeCount}`,
    `After geo filter: ${debug.afterGeoFilterCount}`,
    `Candidates: ${debug.candidatesConsidered}`,
    `OSRM tested: ${debug.osrmTested}`,
    `Valid routes: ${debug.validRoutes}`,
  ];

  if (debug.usedBearingFallback) {
    lines.push('Used TEMPORARY bearing fallback');
  }
  if (debug.overpassError) {
    lines.push(`Overpass error: ${debug.overpassError}`);
  }
  if (debug.routingError) {
    lines.push(`Routing error: ${debug.routingError}`);
  }
  if (debug.bestRouteName) {
    lines.push(`Best route: ${debug.bestRouteName}`);
    lines.push(
      `Duration: ${Math.round(debug.bestRouteDurationMinutes ?? 0)} min`,
    );
  }

  return lines.join('\n');
}

function buildDebug(args: {
  origin: LatLng;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
  searchRadiusMeters: number;
  placesDebug: PlacesFetchDebug | null;
  candidates: CandidateDebugEntry[];
  validRoutes: number;
  usedBearingFallback: boolean;
  overpassError: string | null;
  routingError: string | null;
  bestRouteName: string | null;
  bestRouteDurationMinutes: number | null;
}): DiscoveryDebugSummary {
  const base = {
    origin: args.origin,
    durationId: args.durationId,
    vibeId: args.vibeId,
    searchRadiusMeters: args.searchRadiusMeters,
    osmRawResults: args.placesDebug?.rawElementCount ?? 0,
    normalizedCount: args.placesDebug?.normalizedCount ?? 0,
    afterDedupeCount: args.placesDebug?.afterDedupeCount ?? 0,
    afterGeoFilterCount: args.placesDebug?.afterGeoFilterCount ?? 0,
    candidatesConsidered: args.candidates.length,
    osrmTested: args.candidates.filter((c) => c.osrmDurationMinutes != null)
      .length,
    validRoutes: args.validRoutes,
    usedBearingFallback: args.usedBearingFallback,
    overpassError: args.overpassError,
    routingError: args.routingError,
    bestRouteName: args.bestRouteName,
    bestRouteDurationMinutes: args.bestRouteDurationMinutes,
    candidates: args.candidates,
  };

  return {
    ...base,
    summaryText: formatSummary(base),
  };
}

function logDevSummary(debug: DiscoveryDebugSummary): void {
  if (!__DEV__) {
    return;
  }
  console.log(`\n${debug.summaryText}\n`);
  for (const candidate of debug.candidates) {
    console.log(
      '[Scenic discovery] candidate result',
      candidate.name,
      `${candidate.straightLineKm.toFixed(1)} km`,
      candidate.osrmDurationMinutes != null
        ? `${candidate.osrmDurationMinutes.toFixed(1)} min`
        : 'no OSRM',
      candidate.accepted ? 'ACCEPTED' : `REJECTED: ${candidate.rejectionReason}`,
    );
  }
}

async function evaluateCandidates(args: {
  origin: LatLng;
  originLabel: string;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
  destinations: ScenicDestination[];
  source: 'overpass' | 'bearing-fallback';
}): Promise<{
  valid: RankedCandidate[];
  entries: CandidateDebugEntry[];
  routingFailures: number;
  lastRoutingError: string | null;
}> {
  const window = getDiscoveryDurationWindow(args.durationId);
  const targetOneWayKm = window.maxStraightLineKm * 0.45;
  const shortlist = [...args.destinations]
    .sort(
      (a, b) =>
        prelimScore(b, args.origin, args.vibeId, targetOneWayKm) -
        prelimScore(a, args.origin, args.vibeId, targetOneWayKm),
    )
    .slice(0, MAX_OSRM_CANDIDATES);

  const valid: RankedCandidate[] = [];
  const entries: CandidateDebugEntry[] = [];
  let routingFailures = 0;
  let lastRoutingError: string | null = null;

  for (const destination of shortlist) {
    const straightLineKm = distanceKm(args.origin, destination.coordinate);

    try {
      const stops = buildStops(args.origin, args.originLabel, destination);
      const routed = await fetchDrivingRoute(
        stops.map((stop) => stop.coordinate),
      );
      const durationMinutes = routed.durationSeconds / 60;

      if (
        durationMinutes < window.minMinutes ||
        durationMinutes > window.maxMinutes
      ) {
        entries.push({
          name: destination.name,
          straightLineKm,
          osrmDurationMinutes: durationMinutes,
          accepted: false,
          rejectionReason: `duration ${durationMinutes.toFixed(1)} min outside ${window.minMinutes}-${window.maxMinutes} min window`,
          source: args.source,
        });
        continue;
      }

      const base = {
        destination,
        straightLineKm,
        routed,
        durationMinutes,
        source: args.source,
      };

      valid.push({
        ...base,
        score: finalScore(base, window.targetMinutes, args.vibeId),
      });

      entries.push({
        name: destination.name,
        straightLineKm,
        osrmDurationMinutes: durationMinutes,
        accepted: true,
        rejectionReason: null,
        source: args.source,
      });
    } catch (error) {
      routingFailures += 1;
      lastRoutingError =
        error instanceof Error ? error.message : 'Unknown OSRM failure';
      console.error(
        '[Scenic discovery] OSRM failed',
        destination.name,
        lastRoutingError,
        error,
      );
      entries.push({
        name: destination.name,
        straightLineKm,
        osrmDurationMinutes: null,
        accepted: false,
        rejectionReason: `OSRM failed: ${lastRoutingError}`,
        source: args.source,
      });
    }
  }

  return { valid, entries, routingFailures, lastRoutingError };
}

function userMessageFor(reason: DiscoveryFailureReason): string {
  switch (reason) {
    case 'no_places':
      return 'No scenic places were found nearby.';
    case 'no_fitting_route':
      return 'We found places, but couldn’t build a drive that fits your time.';
    case 'routing_unreachable':
      return 'Scenic couldn’t reach the routing service.';
    case 'overpass_error':
      return 'Scenic couldn’t reach the places search service.';
    case 'invalid_origin':
      return 'Scenic couldn’t read a valid starting location.';
    default:
      return 'No good drives were found nearby.';
  }
}

export async function discoverNearbyDrive(
  input: DiscoverNearbyDriveInput,
): Promise<DiscoverNearbyDriveResult> {
  const window = getDiscoveryDurationWindow(input.durationId);
  const effectiveVibe = input.vibeId ?? 'surprise';

  console.log('[Scenic discovery] start', {
    origin: input.origin,
    latitude: input.origin.latitude,
    longitude: input.origin.longitude,
    durationId: input.durationId,
    vibeId: effectiveVibe,
    searchRadiusMeters: window.searchRadiusMeters,
    acceptMinutes: `${window.minMinutes}-${window.maxMinutes}`,
  });

  let placesDebug: PlacesFetchDebug | null = null;
  let places: ScenicDestination[] = [];
  let overpassError: string | null = null;

  try {
    const fetched = await fetchNearbyScenicPlaces({
      origin: input.origin,
      durationId: input.durationId,
      vibeId: effectiveVibe,
    });
    places = fetched.places;
    placesDebug = fetched.debug;
  } catch (error) {
    overpassError =
      error instanceof Error ? error.message : 'Overpass request failed.';
    console.error('[Scenic discovery] Overpass error', overpassError, error);
    // Do not hard-fail yet — TEMPORARY bearing fallback can still prove routing.
  }

  let usedBearingFallback = false;
  let pool = places;
  let poolSource: 'overpass' | 'bearing-fallback' = 'overpass';

  // TEMPORARY DEV FALLBACK — prove the routing pipeline when OSM is empty/unavailable.
  if (pool.length === 0 && ENABLE_BEARING_FALLBACK) {
    usedBearingFallback = true;
    poolSource = 'bearing-fallback';
    pool = createBearingFallbackCandidates(input.origin, input.durationId);
    console.log(
      '[Scenic discovery] TEMPORARY bearing fallback engaged',
      {
        reason: overpassError
          ? `overpass failed: ${overpassError}`
          : 'overpass returned no usable candidates',
        probes: pool.map((p) => p.name),
      },
    );
  }

  if (pool.length === 0 && overpassError) {
    const debug = buildDebug({
      origin: input.origin,
      durationId: input.durationId,
      vibeId: effectiveVibe,
      searchRadiusMeters: window.searchRadiusMeters,
      placesDebug,
      candidates: [],
      validRoutes: 0,
      usedBearingFallback: false,
      overpassError,
      routingError: null,
      bestRouteName: null,
      bestRouteDurationMinutes: null,
    });
    logDevSummary(debug);

    return {
      status: 'none',
      reason: 'overpass_error',
      message: userMessageFor('overpass_error'),
      debug,
    };
  }

  if (pool.length === 0) {
    const debug = buildDebug({
      origin: input.origin,
      durationId: input.durationId,
      vibeId: effectiveVibe,
      searchRadiusMeters: window.searchRadiusMeters,
      placesDebug,
      candidates: [],
      validRoutes: 0,
      usedBearingFallback,
      overpassError,
      routingError: null,
      bestRouteName: null,
      bestRouteDurationMinutes: null,
    });
    logDevSummary(debug);

    return {
      status: 'none',
      reason: overpassError ? 'overpass_error' : 'no_places',
      message: userMessageFor(overpassError ? 'overpass_error' : 'no_places'),
      debug,
    };
  }

  const evaluation = await evaluateCandidates({
    origin: input.origin,
    originLabel: input.originLabel,
    durationId: input.durationId,
    vibeId: effectiveVibe,
    destinations: pool,
    source: poolSource,
  });

  // If OSM places existed but none fit, still try bearing fallback once.
  if (
    evaluation.valid.length === 0 &&
    poolSource === 'overpass' &&
    ENABLE_BEARING_FALLBACK
  ) {
    usedBearingFallback = true;
    console.log(
      '[Scenic discovery] OSM candidates produced no valid routes — trying TEMPORARY bearing fallback',
    );
    const fallbackEval = await evaluateCandidates({
      origin: input.origin,
      originLabel: input.originLabel,
      durationId: input.durationId,
      vibeId: effectiveVibe,
      destinations: createBearingFallbackCandidates(
        input.origin,
        input.durationId,
      ),
      source: 'bearing-fallback',
    });
    evaluation.valid.push(...fallbackEval.valid);
    evaluation.entries.push(...fallbackEval.entries);
    evaluation.routingFailures += fallbackEval.routingFailures;
    evaluation.lastRoutingError =
      fallbackEval.lastRoutingError ?? evaluation.lastRoutingError;
  }

  if (evaluation.valid.length === 0) {
    const allOsrmFailed =
      evaluation.entries.length > 0 &&
      evaluation.entries.every((entry) => entry.osrmDurationMinutes == null);

    const reason: DiscoveryFailureReason = allOsrmFailed
      ? 'routing_unreachable'
      : places.length === 0 && usedBearingFallback
        ? 'no_fitting_route'
        : places.length === 0
          ? 'no_places'
          : 'no_fitting_route';

    const debug = buildDebug({
      origin: input.origin,
      durationId: input.durationId,
      vibeId: effectiveVibe,
      searchRadiusMeters: window.searchRadiusMeters,
      placesDebug,
      candidates: evaluation.entries,
      validRoutes: 0,
      usedBearingFallback,
      overpassError,
      routingError: evaluation.lastRoutingError,
      bestRouteName: null,
      bestRouteDurationMinutes: null,
    });
    logDevSummary(debug);

    return {
      status: 'none',
      reason,
      message: userMessageFor(reason),
      debug,
    };
  }

  evaluation.valid.sort((a, b) => b.score - a.score);
  const chosen = evaluation.valid[0];

  const debug = buildDebug({
    origin: input.origin,
    durationId: input.durationId,
    vibeId: effectiveVibe,
    searchRadiusMeters: window.searchRadiusMeters,
    placesDebug,
    candidates: evaluation.entries,
    validRoutes: evaluation.valid.length,
    usedBearingFallback,
    overpassError,
    routingError: null,
    bestRouteName: chosen.destination.name,
    bestRouteDurationMinutes: chosen.durationMinutes,
  });
  logDevSummary(debug);

  console.log('[Scenic discovery] chosen', {
    name: chosen.destination.name,
    durationMinutes: chosen.durationMinutes,
    score: chosen.score,
    source: chosen.source,
  });

  const title =
    chosen.source === 'bearing-fallback'
      ? `Probe drive · ${chosen.destination.name}`
      : titleForDestination(
          chosen.destination.name,
          chosen.destination.category,
          effectiveVibe,
        );

  return {
    status: 'ok',
    debug,
    drive: {
      id: `${chosen.destination.id}-${input.durationId}`,
      name: title,
      description:
        chosen.source === 'bearing-fallback'
          ? 'Temporary geographic probe used to verify routing. Remove bearing fallback once OSM discovery is reliable.'
          : chosen.destination.shortDescription,
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
