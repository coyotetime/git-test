import { VibeOption } from '@/constants/options';

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type RouteStop = {
  id: string;
  name: string;
  coordinate: LatLng;
};

export type ScenicRoute = {
  id: string;
  name: string;
  durationMinutes: number;
  distanceKm: number;
  vibeIds: VibeOption['id'][];
  description: string;
  /** Ordered scenic stops. Route geometry is calculated separately via routing. */
  stops: RouteStop[];
};

/**
 * Coast & Lagoon sample route.
 * Waypoints only — driving geometry is fetched from the routing service.
 */
export const SAMPLE_ROUTE: ScenicRoute = {
  id: 'coast-lagoon',
  name: 'Coast & Lagoon',
  durationMinutes: 32,
  distanceKm: 21,
  vibeIds: ['coast', 'views', 'quiet-roads'],
  description:
    'Ocean roads, a beach stop, and a quiet loop through the west shore.',
  stops: [
    {
      id: 'esquimalt-lagoon',
      name: 'Esquimalt Lagoon',
      coordinate: { latitude: 48.42528, longitude: -123.46376 },
    },
    {
      id: 'ocean-boulevard',
      name: 'Ocean Boulevard',
      coordinate: { latitude: 48.42237, longitude: -123.4798 },
    },
    {
      id: 'fort-rodd-hill',
      name: 'Fort Rodd Hill',
      coordinate: { latitude: 48.4335, longitude: -123.4555 },
    },
  ],
};
