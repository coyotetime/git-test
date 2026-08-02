import { useEffect, useState } from 'react';

import { DurationOption, VibeOption } from '@/constants/options';
import { LatLng } from '@/constants/routes';
import {
  GeneratedDrive,
  generateScenicDrive,
} from '@/services/routeGeneration';

type UseScenicDriveInput = {
  origin: LatLng | null;
  originLabel: string;
  durationId: DurationOption['id'];
  vibeId: VibeOption['id'] | null;
  enabled?: boolean;
};

type ScenicDriveState = {
  drive: GeneratedDrive | null;
  isLoading: boolean;
  error: string | null;
  unavailable: boolean;
};

export function useScenicDrive({
  origin,
  originLabel,
  durationId,
  vibeId,
  enabled = true,
}: UseScenicDriveInput): ScenicDriveState {
  const [drive, setDrive] = useState<GeneratedDrive | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!enabled || !origin) {
      return;
    }

    const originCoordinate = origin;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setUnavailable(false);
      setDrive(null);

      try {
        const result = await generateScenicDrive({
          origin: originCoordinate,
          originLabel,
          durationId,
          vibeId,
        });

        if (cancelled) {
          return;
        }

        if (result.status === 'none') {
          setUnavailable(true);
          setDrive(null);
          return;
        }

        setDrive(result.drive);
      } catch {
        if (!cancelled) {
          setError(
            'We couldn’t map this drive right now. Check your connection and try again.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, origin, originLabel, durationId, vibeId]);

  return { drive, isLoading, error, unavailable };
}
