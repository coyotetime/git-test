import { useCallback, useEffect, useState } from 'react';

import { FALLBACK_LOCATION_LABEL } from '@/constants/location';
import { getUserLocation, UserLocation } from '@/services/location';

type UserLocationState = {
  location: UserLocation | null;
  label: string;
  isLoading: boolean;
  refresh: () => Promise<UserLocation>;
};

export function useUserLocation(): UserLocationState {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await getUserLocation({ forceRefresh: true });
    setLocation(result);
    return result;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const result = await getUserLocation();
      if (!cancelled) {
        setLocation(result);
        setIsLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    location,
    label: location?.label ?? FALLBACK_LOCATION_LABEL,
    isLoading,
    refresh,
  };
}
