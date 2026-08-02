import { LatLng } from '@/constants/routes';
import { isValidCoordinate } from '@/services/geo';

/**
 * Development routing helper using the public OSRM demo server.
 *
 * IMPORTANT: The public OSRM endpoint (router.project-osrm.org) is for
 * prototyping only. Replace this with a production routing provider
 * (self-hosted OSRM, Mapbox Directions, Google Routes, etc.) before release.
 *
 * Out-and-back routes (A → B → A) may retrace the same roads. That is
 * acceptable for prototype discovery — do not reject overlap.
 */

type OsrmGeoJsonLineString = {
  type: 'LineString';
  coordinates: [number, number][];
};

type OsrmRouteResponse = {
  code: string;
  message?: string;
  routes?: Array<{
    geometry: OsrmGeoJsonLineString;
    duration: number;
    distance: number;
  }>;
};

export type DrivingRouteResult = {
  geometry: LatLng[];
  durationSeconds: number;
  distanceMeters: number;
};

const routeCache = new Map<string, DrivingRouteResult>();

function cacheKey(waypoints: LatLng[]): string {
  return waypoints
    .map(
      (point) =>
        `${point.latitude.toFixed(5)},${point.longitude.toFixed(5)}`,
    )
    .join('|');
}

function toOsrmCoordinates(waypoints: LatLng[]): string {
  // OSRM expects longitude,latitude pairs.
  return waypoints
    .map((point) => `${point.longitude},${point.latitude}`)
    .join(';');
}

function geoJsonToLatLng(coordinates: [number, number][]): LatLng[] {
  return coordinates.map(([longitude, latitude]) => ({
    latitude,
    longitude,
  }));
}

export async function fetchDrivingRoute(
  waypoints: LatLng[],
): Promise<DrivingRouteResult> {
  if (waypoints.length < 2) {
    throw new Error('At least two waypoints are required to calculate a route.');
  }

  for (const [index, point] of waypoints.entries()) {
    if (!isValidCoordinate(point)) {
      const message = `Invalid waypoint coordinates at index ${index}: ${JSON.stringify(point)}`;
      console.error('[Scenic routing] coordinates are invalid', message);
      throw new Error(message);
    }
  }

  const key = cacheKey(waypoints);
  const cached = routeCache.get(key);
  if (cached) {
    return cached;
  }

  const url =
    `https://router.project-osrm.org/route/v1/driving/${toOsrmCoordinates(waypoints)}` +
    '?overview=full&geometries=geojson';

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    console.error('[Scenic routing] OSRM network failure', error);
    throw new Error(
      `OSRM network failure: ${
        error instanceof Error ? error.message : 'unknown error'
      }`,
    );
  }

  if (!response.ok) {
    const bodyPreview = (await response.text()).slice(0, 240);
    console.error('[Scenic routing] OSRM HTTP failure', response.status, bodyPreview);
    throw new Error(
      `OSRM request failed (${response.status}): ${bodyPreview || 'empty body'}`,
    );
  }

  const raw = await response.text();
  let data: OsrmRouteResponse;
  try {
    data = JSON.parse(raw) as OsrmRouteResponse;
  } catch (parseError) {
    console.error(
      '[Scenic routing] OSRM JSON parsing failed',
      parseError,
      raw.slice(0, 400),
    );
    throw new Error(
      `OSRM JSON parsing failed: ${
        parseError instanceof Error ? parseError.message : 'unknown'
      }`,
    );
  }

  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
    console.error('[Scenic routing] OSRM no route', data.code, data.message);
    throw new Error(
      data.message ??
        `OSRM returned no driving route (code=${data.code ?? 'unknown'}).`,
    );
  }

  const result: DrivingRouteResult = {
    geometry: geoJsonToLatLng(route.geometry.coordinates),
    durationSeconds: route.duration,
    distanceMeters: route.distance,
  };

  routeCache.set(key, result);
  return result;
}
