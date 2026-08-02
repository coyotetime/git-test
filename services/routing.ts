import { LatLng } from '@/constants/routes';

/**
 * Development routing helper using the public OSRM demo server.
 *
 * IMPORTANT: The public OSRM endpoint (router.project-osrm.org) is for
 * prototyping only. Replace this with a production routing provider
 * (self-hosted OSRM, Mapbox Directions, Google Routes, etc.) before release.
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

  const key = cacheKey(waypoints);
  const cached = routeCache.get(key);
  if (cached) {
    return cached;
  }

  const url =
    `https://router.project-osrm.org/route/v1/driving/${toOsrmCoordinates(waypoints)}` +
    '?overview=full&geometries=geojson';

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Unable to reach the routing service.');
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];
  if (data.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
    throw new Error(data.message ?? 'No driving route was found for these stops.');
  }

  const result: DrivingRouteResult = {
    geometry: geoJsonToLatLng(route.geometry.coordinates),
    durationSeconds: route.duration,
    distanceMeters: route.distance,
  };

  routeCache.set(key, result);
  return result;
}
