import * as Location from 'expo-location';

import {
  FALLBACK_COORDINATE,
  FALLBACK_LOCATION_LABEL,
} from '@/constants/location';
import { LatLng } from '@/constants/routes';

export type UserLocation = {
  coordinate: LatLng;
  label: string;
  isApproximate: boolean;
};

let sessionLocation: UserLocation | null = null;

function formatLocationLabel(
  places: Location.LocationGeocodedAddress[],
): string {
  const place = places[0];
  if (!place) {
    return FALLBACK_LOCATION_LABEL;
  }

  const city =
    place.city || place.subregion || place.district || place.name || null;
  const region = place.region || place.isoCountryCode || null;

  if (city && region) {
    const shortRegion =
      region.length > 3 && region.includes(' ')
        ? region
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : region;
    return `${city}, ${shortRegion}`;
  }

  return city || FALLBACK_LOCATION_LABEL;
}

/**
 * Fetches the current position once for the session.
 * Does not watch/track location continuously.
 */
export async function getUserLocation(
  options: { forceRefresh?: boolean } = {},
): Promise<UserLocation> {
  if (sessionLocation && !options.forceRefresh) {
    return sessionLocation;
  }

  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      sessionLocation = {
        coordinate: FALLBACK_COORDINATE,
        label: FALLBACK_LOCATION_LABEL,
        isApproximate: true,
      };
      return sessionLocation;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const coordinate: LatLng = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };

    let label = FALLBACK_LOCATION_LABEL;
    try {
      const places = await Location.reverseGeocodeAsync(coordinate);
      label = formatLocationLabel(places);
    } catch {
      label = FALLBACK_LOCATION_LABEL;
    }

    sessionLocation = {
      coordinate,
      label,
      isApproximate: false,
    };
    return sessionLocation;
  } catch {
    sessionLocation = {
      coordinate: FALLBACK_COORDINATE,
      label: FALLBACK_LOCATION_LABEL,
      isApproximate: true,
    };
    return sessionLocation;
  }
}
