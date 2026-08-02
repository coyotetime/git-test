import { getDurationWindow } from '@/constants/duration';
import {
  DestinationCategory,
  ScenicDestination,
} from '@/constants/destinations';
import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng } from '@/constants/routes';
import { distanceKm } from '@/services/geo';

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

/**
 * Public Overpass mirrors for prototyping only.
 * Replace with a hosted/production Overpass (or another places provider) before release.
 */
const OVERPASS_URLS = [
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter',
];
const OVERPASS_TIMEOUT_MS = 45_000;
const MIN_DISTANCE_KM = 2;
const MAX_RESULTS = 50;

type CacheEntry = {
  expiresAt: number;
  places: ScenicDestination[];
};

const placesCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 12;

function cacheKey(input: FetchNearbyPlacesInput): string {
  const window = getDurationWindow(input.durationId);
  // ~1km cache buckets so tiny location changes reuse results.
  const lat = input.origin.latitude.toFixed(2);
  const lng = input.origin.longitude.toFixed(2);
  return `${lat}|${lng}|${window.searchRadiusMeters}|${input.vibeId ?? 'surprise'}`;
}

function buildOverpassQuery(
  origin: LatLng,
  radiusMeters: number,
  includeCafes: boolean,
): string {
  const { latitude, longitude } = origin;
  const around = `around:${radiusMeters},${latitude},${longitude}`;

  const cafeClause = includeCafes
    ? `nwr["amenity"="cafe"]["name"](${around});`
    : '';

  // Focused scenic categories. Names are preferred and enforced after fetch.
  return `
[out:json][timeout:60];
(
  nwr["tourism"="viewpoint"](${around});
  nwr["natural"="beach"](${around});
  nwr["leisure"="park"]["name"](${around});
  nwr["leisure"="nature_reserve"](${around});
  nwr["natural"="water"]["water"="lake"]["name"](${around});
  nwr["tourism"="picnic_site"](${around});
  nwr["tourism"="attraction"]["name"](${around});
  ${cafeClause}
);
out center ${MAX_RESULTS};
`.trim();
}

function inferCategory(tags: Record<string, string>): DestinationCategory {
  if (tags.tourism === 'viewpoint') return 'viewpoint';
  if (tags.natural === 'beach') return 'beach';
  if (tags.leisure === 'nature_reserve') return 'nature_reserve';
  if (tags.leisure === 'park') return 'park';
  if (tags.water === 'lake' || tags.natural === 'water') return 'lake';
  if (tags.tourism === 'picnic_site') return 'picnic_site';
  if (tags.amenity === 'cafe') return 'cafe';
  if (tags.tourism === 'attraction') return 'attraction';
  return 'scenic';
}

function inferVibes(
  category: DestinationCategory,
  tags: Record<string, string>,
): ScenicDestination['vibes'] {
  const vibes = new Set<ScenicDestination['vibes'][number]>();

  switch (category) {
    case 'viewpoint':
      vibes.add('views');
      vibes.add('quiet-roads');
      break;
    case 'beach':
      vibes.add('coast');
      vibes.add('views');
      break;
    case 'nature_reserve':
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
      vibes.add('views');
      break;
    default:
      vibes.add('views');
      break;
  }

  const name = (tags.name ?? '').toLowerCase();
  if (/(beach|bay|coast|shore|ocean|sea)/.test(name)) {
    vibes.add('coast');
    vibes.add('views');
  }
  if (/(lake|forest|cedar|woods|river|falls)/.test(name)) {
    vibes.add('forest');
  }
  if (/(lookout|viewpoint|mountain|peak|hill)/.test(name)) {
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
    case 'park':
      return `A green pause at ${name} before turning back.`;
    case 'nature_reserve':
      return `Quieter roads and wilder edges around ${name}.`;
    case 'lake':
      return `A calm water-bound turnaround at ${name}.`;
    case 'picnic_site':
      return `An easy outdoor stop at ${name}.`;
    case 'cafe':
      return `A coffee-worthy destination at ${name}.`;
    case 'attraction':
      return `A local highlight centered on ${name}.`;
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
    return null;
  }

  const category = inferCategory(tags);
  const vibes = inferVibes(category, tags);

  return {
    id: `overpass-${element.type}-${element.id}`,
    name,
    coordinate: { latitude, longitude },
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

export async function fetchNearbyScenicPlaces(
  input: FetchNearbyPlacesInput,
): Promise<ScenicDestination[]> {
  const key = cacheKey(input);
  const cached = placesCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    console.log('[Scenic places] cache hit', key, cached.places.length);
    return cached.places;
  }

  const window = getDurationWindow(input.durationId);
  const includeCafes = input.vibeId === 'coffee' || input.vibeId === 'surprise';
  const query = buildOverpassQuery(
    input.origin,
    window.searchRadiusMeters,
    includeCafes,
  );

  console.log('[Scenic places] Overpass search', {
    origin: input.origin,
    radiusMeters: window.searchRadiusMeters,
    vibeId: input.vibeId,
  });

  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

    try {
      console.log('[Scenic places] trying Overpass mirror', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          // Some public Overpass mirrors reject requests without a UA.
          'User-Agent': 'ScenicApp/1.0 (prototype; scenic-drives)',
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Overpass request failed (${response.status}).`);
      }

      const raw = await response.text();
      let data: OverpassResponse;
      try {
        data = JSON.parse(raw) as OverpassResponse;
      } catch {
        throw new Error('Overpass returned an unexpected response.');
      }

      const elements = data.elements ?? [];
      if (elements.length === 0) {
        // Empty payloads are often transient on busy public mirrors.
        throw new Error('Overpass returned no places for this search.');
      }

      const normalized = elements
        .map(normalizeElement)
        .filter((place): place is ScenicDestination => place != null);

      const filtered = dedupePlaces(normalized).filter((place) => {
        const km = distanceKm(input.origin, place.coordinate);
        return km >= MIN_DISTANCE_KM && km <= window.maxStraightLineKm;
      });

      console.log('[Scenic places] normalized', filtered.length);

      placesCache.set(key, {
        expiresAt: Date.now() + CACHE_TTL_MS,
        places: filtered,
      });

      return filtered;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        lastError = new Error('Nearby place search timed out. Please try again.');
      } else {
        lastError =
          error instanceof Error
            ? error
            : new Error('Unable to search nearby places right now.');
      }
      console.log('[Scenic places] mirror failed', endpoint, lastError.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error('Unable to search nearby places right now.');
}
