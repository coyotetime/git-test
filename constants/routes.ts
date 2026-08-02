import { VibeOption } from '@/constants/options';

export type RouteStop = {
  id: string;
  name: string;
};

export type ScenicRoute = {
  id: string;
  name: string;
  durationMinutes: number;
  distanceKm: number;
  vibeIds: VibeOption['id'][];
  description: string;
  stops: RouteStop[];
};

export const SAMPLE_ROUTE: ScenicRoute = {
  id: 'coast-lagoon',
  name: 'Coast & Lagoon',
  durationMinutes: 32,
  distanceKm: 21,
  vibeIds: ['coast', 'views', 'quiet-roads'],
  description:
    'Ocean roads, a beach stop, and a quiet loop through the west shore.',
  stops: [
    { id: 'esquimalt-lagoon', name: 'Esquimalt Lagoon' },
    { id: 'ocean-boulevard', name: 'Ocean Boulevard' },
    { id: 'fort-rodd-hill', name: 'Fort Rodd Hill' },
  ],
};
