import { useEffect, useState } from 'react';

import { LatLng } from '@/constants/routes';
import { fetchDrivingRoute } from '@/services/routing';

type DrivingRouteState = {
  polyline: LatLng[] | null;
  isLoading: boolean;
  error: string | null;
};

export function useDrivingRoute(waypoints: LatLng[]): DrivingRouteState {
  const [polyline, setPolyline] = useState<LatLng[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const waypointKey = waypoints
    .map((point) => `${point.latitude},${point.longitude}`)
    .join('|');

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      setIsLoading(true);
      setError(null);
      setPolyline(null);

      try {
        const geometry = await fetchDrivingRoute(waypoints);
        if (!cancelled) {
          setPolyline(geometry);
        }
      } catch {
        if (!cancelled) {
          setError(
            'We couldn’t map this drive right now. Check your connection and try again.',
          );
          setPolyline(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadRoute();

    return () => {
      cancelled = true;
    };
    // waypointKey captures coordinate identity for this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypointKey]);

  return { polyline, isLoading, error };
}
