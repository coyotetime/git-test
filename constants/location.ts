import { LatLng } from '@/constants/routes';

export const FALLBACK_LOCATION_LABEL = 'Victoria, BC';

/**
 * Used only when foreground location permission is unavailable.
 * Route matching still evaluates destinations relative to this coordinate;
 * it is not a special-cased city for waypoint selection.
 */
export const FALLBACK_COORDINATE: LatLng = {
  latitude: 48.4284,
  longitude: -123.3656,
};
