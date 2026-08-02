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
  stops: RouteStop[];
  /** Ordered coordinates used to draw the route polyline on the map. */
  polyline: LatLng[];
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
    {
      id: 'esquimalt-lagoon',
      name: 'Esquimalt Lagoon',
      coordinate: { latitude: 48.42722, longitude: -123.4675 },
    },
    {
      id: 'ocean-boulevard',
      name: 'Ocean Boulevard',
      coordinate: { latitude: 48.4239, longitude: -123.4798 },
    },
    {
      id: 'fort-rodd-hill',
      name: 'Fort Rodd Hill',
      coordinate: { latitude: 48.43111, longitude: -123.44944 },
    },
  ],
  polyline: [
    { latitude: 48.42722, longitude: -123.4675 },
    { latitude: 48.4258, longitude: -123.4722 },
    { latitude: 48.4239, longitude: -123.4798 },
    { latitude: 48.4251, longitude: -123.4704 },
    { latitude: 48.4284, longitude: -123.4586 },
    { latitude: 48.43111, longitude: -123.44944 },
  ],
};
