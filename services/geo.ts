import { LatLng } from '@/constants/routes';

const EARTH_RADIUS_KM = 6371;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

/** Great-circle distance between two coordinates, in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

/** Point at `distanceKm` along `bearingDegrees` from origin. */
export function pointAtBearing(
  origin: LatLng,
  bearingDegrees: number,
  distanceKmValue: number,
): LatLng {
  const angularDistance = distanceKmValue / EARTH_RADIUS_KM;
  const bearing = toRad(bearingDegrees);
  const lat1 = toRad(origin.latitude);
  const lng1 = toRad(origin.longitude);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    latitude: toDeg(lat2),
    longitude: ((toDeg(lng2) + 540) % 360) - 180,
  };
}

export function isValidCoordinate(point: LatLng | null | undefined): boolean {
  if (!point) {
    return false;
  }
  const { latitude, longitude } = point;
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}
