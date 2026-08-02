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
  /** Ordered road-following coordinates used to draw the route polyline. */
  polyline: LatLng[];
};

/**
 * Coast & Lagoon sample route.
 * Polyline follows Ocean Boulevard west from Esquimalt Lagoon,
 * turns around near the west shore, then continues to Fort Rodd Hill.
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
  polyline: [
    { latitude: 48.42528, longitude: -123.46376 },
    { latitude: 48.4250, longitude: -123.46409 },
    { latitude: 48.42445, longitude: -123.46472 },
    { latitude: 48.42419, longitude: -123.46503 },
    { latitude: 48.42394, longitude: -123.46532 },
    { latitude: 48.42365, longitude: -123.46566 },
    { latitude: 48.42338, longitude: -123.46598 },
    { latitude: 48.42307, longitude: -123.46635 },
    { latitude: 48.42267, longitude: -123.46683 },
    { latitude: 48.42239, longitude: -123.46716 },
    { latitude: 48.42215, longitude: -123.46742 },
    { latitude: 48.42199, longitude: -123.4676 },
    { latitude: 48.42179, longitude: -123.46781 },
    { latitude: 48.42157, longitude: -123.46805 },
    { latitude: 48.42137, longitude: -123.46825 },
    { latitude: 48.42108, longitude: -123.46856 },
    { latitude: 48.42092, longitude: -123.46873 },
    { latitude: 48.42051, longitude: -123.46915 },
    { latitude: 48.42008, longitude: -123.4696 },
    { latitude: 48.41967, longitude: -123.47004 },
    { latitude: 48.41921, longitude: -123.47051 },
    { latitude: 48.41899, longitude: -123.47074 },
    { latitude: 48.41881, longitude: -123.47091 },
    { latitude: 48.41863, longitude: -123.47106 },
    { latitude: 48.41845, longitude: -123.47123 },
    { latitude: 48.41826, longitude: -123.4714 },
    { latitude: 48.41797, longitude: -123.47167 },
    { latitude: 48.41778, longitude: -123.47186 },
    { latitude: 48.41761, longitude: -123.47201 },
    { latitude: 48.41743, longitude: -123.47219 },
    { latitude: 48.41714, longitude: -123.47245 },
    { latitude: 48.41787, longitude: -123.47403 },
    { latitude: 48.41829, longitude: -123.47494 },
    { latitude: 48.41871, longitude: -123.47586 },
    { latitude: 48.41928, longitude: -123.47712 },
    { latitude: 48.41939, longitude: -123.47736 },
    { latitude: 48.4199, longitude: -123.47852 },
    { latitude: 48.42039, longitude: -123.47956 },
    { latitude: 48.42068, longitude: -123.48019 },
    { latitude: 48.42077, longitude: -123.48044 },
    { latitude: 48.42098, longitude: -123.48032 },
    { latitude: 48.42237, longitude: -123.4798 },
    { latitude: 48.42098, longitude: -123.48032 },
    { latitude: 48.42077, longitude: -123.48044 },
    { latitude: 48.42068, longitude: -123.48019 },
    { latitude: 48.42039, longitude: -123.47956 },
    { latitude: 48.4199, longitude: -123.47852 },
    { latitude: 48.41939, longitude: -123.47736 },
    { latitude: 48.41928, longitude: -123.47712 },
    { latitude: 48.41871, longitude: -123.47586 },
    { latitude: 48.41829, longitude: -123.47494 },
    { latitude: 48.41787, longitude: -123.47403 },
    { latitude: 48.41714, longitude: -123.47245 },
    { latitude: 48.41743, longitude: -123.47219 },
    { latitude: 48.41761, longitude: -123.47201 },
    { latitude: 48.41778, longitude: -123.47186 },
    { latitude: 48.41797, longitude: -123.47167 },
    { latitude: 48.41826, longitude: -123.4714 },
    { latitude: 48.41845, longitude: -123.47123 },
    { latitude: 48.41861, longitude: -123.47109 },
    { latitude: 48.41881, longitude: -123.47091 },
    { latitude: 48.41897, longitude: -123.47076 },
    { latitude: 48.41918, longitude: -123.47054 },
    { latitude: 48.4196, longitude: -123.4701 },
    { latitude: 48.42001, longitude: -123.46968 },
    { latitude: 48.42049, longitude: -123.46918 },
    { latitude: 48.42092, longitude: -123.46873 },
    { latitude: 48.42108, longitude: -123.46856 },
    { latitude: 48.42137, longitude: -123.46825 },
    { latitude: 48.42157, longitude: -123.46805 },
    { latitude: 48.42179, longitude: -123.46781 },
    { latitude: 48.42199, longitude: -123.4676 },
    { latitude: 48.42215, longitude: -123.46742 },
    { latitude: 48.42239, longitude: -123.46716 },
    { latitude: 48.42266, longitude: -123.46684 },
    { latitude: 48.42307, longitude: -123.46635 },
    { latitude: 48.42325, longitude: -123.46613 },
    { latitude: 48.42365, longitude: -123.46566 },
    { latitude: 48.42394, longitude: -123.46532 },
    { latitude: 48.42419, longitude: -123.46503 },
    { latitude: 48.42436, longitude: -123.46483 },
    { latitude: 48.4250, longitude: -123.46409 },
    { latitude: 48.42524, longitude: -123.4638 },
    { latitude: 48.42586, longitude: -123.46307 },
    { latitude: 48.42621, longitude: -123.46265 },
    { latitude: 48.42655, longitude: -123.46226 },
    { latitude: 48.42682, longitude: -123.46194 },
    { latitude: 48.4271, longitude: -123.46161 },
    { latitude: 48.42728, longitude: -123.46138 },
    { latitude: 48.42761, longitude: -123.46092 },
    { latitude: 48.42776, longitude: -123.4607 },
    { latitude: 48.42796, longitude: -123.4604 },
    { latitude: 48.42815, longitude: -123.46012 },
    { latitude: 48.42831, longitude: -123.45989 },
    { latitude: 48.42862, longitude: -123.45944 },
    { latitude: 48.42882, longitude: -123.45915 },
    { latitude: 48.42907, longitude: -123.45879 },
    { latitude: 48.42927, longitude: -123.4585 },
    { latitude: 48.42945, longitude: -123.45824 },
    { latitude: 48.42961, longitude: -123.45802 },
    { latitude: 48.42984, longitude: -123.4577 },
    { latitude: 48.43007, longitude: -123.45735 },
    { latitude: 48.43023, longitude: -123.45713 },
    { latitude: 48.4304, longitude: -123.45702 },
    { latitude: 48.43112, longitude: -123.45679 },
    { latitude: 48.43138, longitude: -123.45671 },
    { latitude: 48.43163, longitude: -123.45668 },
    { latitude: 48.43185, longitude: -123.45672 },
    { latitude: 48.43209, longitude: -123.45688 },
    { latitude: 48.43236, longitude: -123.45716 },
    { latitude: 48.43263, longitude: -123.45733 },
    { latitude: 48.4329, longitude: -123.45729 },
    { latitude: 48.43308, longitude: -123.4571 },
    { latitude: 48.43345, longitude: -123.45653 },
    { latitude: 48.4335, longitude: -123.4555 },
  ],
};
