import { getDiscoveryDurationWindow } from '@/constants/duration';
import {
  DestinationCategory,
  ScenicDestination,
} from '@/constants/destinations';
import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng } from '@/constants/routes';
import { distanceKm, isValidCoordinate } from '@/services/geo';

/**
 * Nearby place discovery via the public OpenStreetMap Overpass API.
 *
 * IMPORTANT: The public Overpass endpoint is for prototyping only.
 * Replace or self-host Overpass before production release.
 */

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type FetchNearbyPlacesInput = {
  origin: LatLng;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
};

export type PlacesFetchDebug = {
  origin: LatLng;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
  searchRadiusMeters: number;
  maxStraightLineKm: number;
  rawElementCount: number;
  normalizedCount: number;
  afterDedupeCount: number;
  afterGeoFilterCount: number;
  cacheHit: boolean;
  endpointUsed: string | null;
  overpassError: string | null;
};

export type PlacesFetchResult = {
  places: ScenicDestination[];
  debug: PlacesFetchDebug;
};

/**
 * Public Overpass mirrors for prototyping only.
 * Replace with a hosted/production Overpass (or another places provider) before release.
 */
const OVERPASS_URLS = [
  // mail.ru has been the most reliable public mirror for this prototype.
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
/** Per-mirror timeout for a single parallel attempt. */
const OVERPASS_TIMEOUT_MS = 10_000;
/** Wait this long for the first successful mirror before falling back. */
const OVERPASS_TOTAL_BUDGET_MS = 14_000;
const MIN_DISTANCE_KM = 1;
/** Cap useful candidates returned to discovery before OSRM. */
const MAX_USEFUL_CANDIDATES = 30;
const OVERPASS_OUT_LIMIT = 40;

type CacheEntry = {
  expiresAt: number;
  places: ScenicDestination[];
  debug: PlacesFetchDebug;
};

const placesCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 12;

function cacheKey(input: FetchNearbyPlacesInput): string {
  const window = getDiscoveryDurationWindow(input.durationId);
  const lat = input.origin.latitude.toFixed(2);
  const lng = input.origin.longitude.toFixed(2);
  return `${lat}|${lng}|${window.searchRadiusMeters}|${input.vibeId ?? 'surprise'}`;
}

function buildOverpassQuery(
  origin: LatLng,
  radiusMeters: number,
  includeCafes: boolean,
  mode: 'fast' | 'lite' | 'full' = 'fast',
): string {
  const { latitude, longitude } = origin;
  const around = `around:${radiusMeters},${latitude},${longitude}`;

  const cafeClause = includeCafes
    ? `node["amenity"="cafe"]["name"](${around});`
    : '';

  if (mode === 'fast') {
    // Tiny scenic set proven faster on public mirrors. Ways included for beaches.
    return `
[out:json][timeout:12];
(
  nwr["natural"="beach"](${around});
  nwr["tourism"="viewpoint"](${around});
  ${cafeClause}
);
out center ${OVERPASS_OUT_LIMIT};
`.trim();
  }

  if (mode === 'lite') {
    return `
[out:json][timeout:15];
(
  nwr["tourism"="viewpoint"](${around});
  nwr["natural"="beach"](${around});
  nwr["leisure"="park"]["name"](${around});
  nwr["tourism"="attraction"]["name"](${around});
  nwr["natural"="peak"](${around});
  nwr["natural"="bay"](${around});
  nwr["tourism"="picnic_site"](${around});
  ${cafeClause}
);
out center ${OVERPASS_OUT_LIMIT};
`.trim();
  }

  // Broad scenic / outdoor set. Names preferred; enforced after fetch.
  return `
[out:json][timeout:25];
(
  nwr["tourism"="viewpoint"](${around});
  nwr["natural"="beach"](${around});
  nwr["leisure"="park"](${around});
  nwr["leisure"="nature_reserve"](${around});
  nwr["boundary"="protected_area"](${around});
  nwr["tourism"="attraction"](${around});
  nwr["tourism"="picnic_site"](${around});
  nwr["natural"="peak"](${around});
  nwr["natural"="bay"](${around});
  nwr["natural"="water"](${around});
  nwr["place"="locality"]["name"](${around});
  ${cafeClause}
);
out center ${OVERPASS_OUT_LIMIT};
`.trim();
}

function inferCategory(tags: Record<string, string>): DestinationCategory {
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.natural === 'beach') return 'beach';
  if (tags.natural === 'bay') return 'bay';
  if (tags.natural === 'peak') return 'peak';
  if (tags.leisure === 'nature_reserve') return 'nature_reserve';
  if (tags.boundary === 'protected_area') return 'protected_area';
  if (tags.leisure === 'park') return 'park';
  if (tags.natural === 'water' || tags.water) return 'lake';
  if (tags.tourism === 'picnic_site') return 'picnic_site';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.tourism === 'attraction') return 'attraction';
  if (tags.place === 'locality') return 'locality';
  return 'scenic';
}

function inferVibes(
  category: DestinationCategory,
  tags: Record<string, string>,
): ScenicDestination['vibes'] {
  const vibes = new Set<ScenicDestination['vibes'][number]>();

  switch (category) {
    case 'viewpoint':
    case 'peak':
      vibes.add('views');
      vibes.add('quiet-roads');
      break;
    case 'beach':
    case 'bay':
      vibes.add('coast');
      vibes.add('views');
      break;
    case 'nature_reserve':
    case 'protected_area':
    case 'lake':
      vibes.add('forest');
      vibes.add('quiet-roads');
      vibes.add('views');
      break;
    case 'park':
      vibes.add('quiet-roads');
      vibes.add('forest');
      break;
    case 'picnic_site':
      vibes.add('quiet-roads');
      break;
    case 'cafe':
      vibes.add('coffee');
      break;
    case 'attraction':
    case 'locality':
      vibes.add('views');
      break;
    default:
      vibes.add('views');
      break;
  }

  const name = (tags.name ?? '').toLowerCase();
  if (/(beach|bay|coast|shore|ocean|sea|harbour|harbor)/.test(name)) {
    vibes.add('coast');
    vibes.add('views');
  }
  if (/(lake|forest|cedar|woods|river|falls|creek)/.test(name)) {
    vibes.add('forest');
  }
  if (/(lookout|viewpoint|mountain|peak|hill|bluff)/.test(name)) {
    vibes.add('views');
  }

  return Array.from(vibes);
}

function descriptionFor(category: DestinationCategory, name: string): string {
  switch (category) {
    case 'viewpoint':
      return `A nearby lookout worth the short drive to ${name}.`;
    case 'beach':
      return `Coastal air and an easy loop out to ${name}.`;
    case 'bay':
      return `A shoreline turnaround around ${name}.`;
    case 'peak':
      return `A higher vantage near ${name}.`;
    case 'park':
      return `A green pause at ${name} before turning back.`;
    case 'nature_reserve':
    case 'protected_area':
      return `Quieter roads and wilder edges around ${name}.`;
    case 'lake':
      return `A calm water-bound turnaround at ${name}.`;
    case 'picnic_site':
      return `An easy outdoor stop at ${name}.`;
    case 'cafe':
      return `A coffee-worthy destination at ${name}.`;
    case 'attraction':
      return `A local highlight centered on ${name}.`;
    case 'locality':
      return `A short scenic run out toward ${name}.`;
    default:
      return `A scenic turnaround at ${name}.`;
  }
}

function normalizeElement(element: OverpassElement): ScenicDestination | null {
  const tags = element.tags ?? {};
  const name = tags.name?.trim();
  if (!name) {
    return null;
  }

  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  if (latitude == null || longitude == null) {
    if (__DEV__) {
      console.log(
        '[Scenic places] invalid coordinates (missing lat/lon)',
        element.type,
        element.id,
        name,
      );
    }
    return null;
  }

  const coordinate = { latitude, longitude };
  if (!isValidCoordinate(coordinate)) {
    if (__DEV__) {
      console.log(
        '[Scenic places] invalid coordinates',
        name,
        coordinate,
      );
    }
    return null;
  }

  const category = inferCategory(tags);
  const vibes = inferVibes(category, tags);

  return {
    id: `overpass-${element.type}-${element.id}`,
    name,
    coordinate,
    category,
    vibes,
    shortDescription: descriptionFor(category, name),
    source: 'overpass',
  };
}

function dedupePlaces(places: ScenicDestination[]): ScenicDestination[] {
  const seen = new Set<string>();
  const result: ScenicDestination[] = [];

  for (const place of places) {
    const key = `${place.name.toLowerCase()}|${place.coordinate.latitude.toFixed(3)}|${place.coordinate.longitude.toFixed(3)}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(place);
  }

  return result;
}

function emptyDebug(
  input: FetchNearbyPlacesInput,
  extras: Partial<PlacesFetchDebug> = {},
): PlacesFetchDebug {
  const window = getDiscoveryDurationWindow(input.durationId);
  return {
    origin: input.origin,
    durationId: input.durationId,
    vibeId: input.vibeId,
    searchRadiusMeters: window.searchRadiusMeters,
    maxStraightLineKm: window.maxStraightLineKm,
    rawElementCount: 0,
    normalizedCount: 0,
    afterDedupeCount: 0,
    afterGeoFilterCount: 0,
    cacheHit: false,
    endpointUsed: null,
    overpassError: null,
    ...extras,
  };
}

export async function fetchNearbyScenicPlaces(
  input: FetchNearbyPlacesInput,
): Promise<PlacesFetchResult> {
  if (!isValidCoordinate(input.origin)) {
    const message = `Invalid origin coordinates: ${JSON.stringify(input.origin)}`;
    console.error('[Scenic places] coordinates are invalid', message);
    throw new Error(message);
  }

  const key = cacheKey(input);
  const cached = placesCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    console.log('[Scenic places] cache hit', key, cached.places.length);
    return {
      places: cached.places,
      debug: { ...cached.debug, cacheHit: true },
    };
  }

  const window = getDiscoveryDurationWindow(input.durationId);
  const includeCafes = input.vibeId === 'coffee' || input.vibeId === 'surprise';
  // One compact query, raced across mirrors — first non-empty wins.
  const mode = 'fast' as const;
  const query = buildOverpassQuery(
    input.origin,
    window.searchRadiusMeters,
    includeCafes,
    mode,
  );

  console.log('[Scenic places] Overpass search', {
    origin: input.origin,
    radiusMeters: window.searchRadiusMeters,
    durationId: input.durationId,
    vibeId: input.vibeId,
    mode,
    budgetMs: OVERPASS_TOTAL_BUDGET_MS,
  });

  type MirrorSuccess = {
    endpoint: string;
    elements: OverpassElement[];
  };

  const fetchMirror = async (endpoint: string): Promise<MirrorSuccess> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'ScenicApp/1.0 (prototype; scenic-drives)',
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        const bodyPreview = (await response.text()).slice(0, 240);
        throw new Error(
          `Overpass request failed (${response.status}) at ${endpoint}: ${bodyPreview}`,
        );
      }

      const raw = await response.text();
      let data: OverpassResponse;
      try {
        data = JSON.parse(raw) as OverpassResponse;
      } catch (parseError) {
        throw new Error(
          `Overpass JSON parsing failed at ${endpoint}: ${
            parseError instanceof Error ? parseError.message : 'unknown'
          }`,
        );
      }

      const elements = data.elements ?? [];
      if (elements.length === 0) {
        throw new Error(`Overpass returned no places (${endpoint}).`);
      }

      console.log(
        '[Scenic places] mirror hit',
        endpoint,
        `${elements.length} elements`,
      );
      return { endpoint, elements };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.name === 'AbortError'
            ? `Overpass timed out after ${OVERPASS_TIMEOUT_MS}ms (${endpoint})`
            : error.message
          : 'Overpass mirror failed';
      console.log('[Scenic places] Overpass mirror unavailable', message);
      throw new Error(message);
    } finally {
      clearTimeout(timeout);
    }
  };

  let winner: MirrorSuccess;
  try {
    console.log('[Scenic places] racing mirrors', mode, OVERPASS_URLS.length);
    winner = await Promise.any(OVERPASS_URLS.map((url) => fetchMirror(url)));
  } catch (error) {
    const message =
      error instanceof AggregateError
        ? error.errors
            .map((item) => (item instanceof Error ? item.message : String(item)))
            .join(' | ')
        : error instanceof Error
          ? error.message
          : 'Unable to search nearby places right now.';
    console.log('[Scenic places] Overpass failed completely', message);

    // Distinguish "all empty" from hard failures when possible.
    if (message.includes('returned no places')) {
      const debug = emptyDebug(input, {
        overpassError: null,
        endpointUsed: OVERPASS_URLS[0],
      });
      return { places: [], debug };
    }

    throw new Error(message);
  }

  const normalized = winner.elements
    .map(normalizeElement)
    .filter((place): place is ScenicDestination => place != null);
  const deduped = dedupePlaces(normalized);
  const filtered = deduped
    .filter((place) => {
      const km = distanceKm(input.origin, place.coordinate);
      return km >= MIN_DISTANCE_KM && km <= window.maxStraightLineKm;
    })
    .slice(0, MAX_USEFUL_CANDIDATES);

  const debug = emptyDebug(input, {
    rawElementCount: winner.elements.length,
    normalizedCount: normalized.length,
    afterDedupeCount: deduped.length,
    afterGeoFilterCount: filtered.length,
    endpointUsed: `${winner.endpoint} (${mode})`,
  });

  console.log('[Scenic places] pipeline counts', {
    mode,
    endpoint: winner.endpoint,
    raw: debug.rawElementCount,
    normalized: debug.normalizedCount,
    afterDedupe: debug.afterDedupeCount,
    afterGeoFilter: debug.afterGeoFilterCount,
  });

  if (__DEV__) {
    for (const place of filtered) {
      console.log(
        '[Scenic places] candidate',
        place.name,
        `${distanceKm(input.origin, place.coordinate).toFixed(1)} km`,
        place.category,
      );
    }
  }

  placesCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    places: filtered,
    debug,
  });

  return { places: filtered, debug };
}
