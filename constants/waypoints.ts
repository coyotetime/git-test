import { LatLng } from '@/constants/routes';
import { VibeOption } from '@/constants/options';

export type ScenicWaypoint = {
  id: string;
  name: string;
  coordinate: LatLng;
  vibes: Array<Exclude<VibeOption['id'], 'surprise'>>;
  /** Rough road distance from downtown Victoria, in kilometres. */
  approximateDistanceFromVictoria: number;
  shortDescription: string;
};

export const SCENIC_WAYPOINTS: ScenicWaypoint[] = [
  {
    id: 'dallas-road',
    name: 'Dallas Road',
    coordinate: { latitude: 48.4069, longitude: -123.3681 },
    vibes: ['coast', 'views'],
    approximateDistanceFromVictoria: 3,
    shortDescription: 'Open water views along Victoria’s southern shoreline.',
  },
  {
    id: 'cattle-point',
    name: 'Cattle Point',
    coordinate: { latitude: 48.4275, longitude: -123.2947 },
    vibes: ['coast', 'views', 'quiet-roads'],
    approximateDistanceFromVictoria: 7,
    shortDescription: 'Rocky shoreline lookouts on the edge of Oak Bay.',
  },
  {
    id: 'esquimalt-lagoon',
    name: 'Esquimalt Lagoon',
    coordinate: { latitude: 48.42528, longitude: -123.46376 },
    vibes: ['coast', 'views', 'quiet-roads'],
    approximateDistanceFromVictoria: 9,
    shortDescription: 'A calm lagoon drive with beach stops and sea air.',
  },
  {
    id: 'mount-douglas',
    name: 'Mount Douglas',
    coordinate: { latitude: 48.4928, longitude: -123.3447 },
    vibes: ['views', 'forest', 'quiet-roads'],
    approximateDistanceFromVictoria: 10,
    shortDescription: 'Tree-lined roads up to one of the city’s best lookouts.',
  },
  {
    id: 'cordova-bay',
    name: 'Cordova Bay',
    coordinate: { latitude: 48.5165, longitude: -123.3588 },
    vibes: ['coast', 'quiet-roads', 'coffee'],
    approximateDistanceFromVictoria: 13,
    shortDescription: 'A softer coastal loop with room to pause and wander.',
  },
  {
    id: 'thetis-lake',
    name: 'Thetis Lake',
    coordinate: { latitude: 48.4689, longitude: -123.4682 },
    vibes: ['forest', 'quiet-roads'],
    approximateDistanceFromVictoria: 14,
    shortDescription: 'Shaded park roads and a classic west-shore forest pause.',
  },
  {
    id: 'goldstream',
    name: 'Goldstream',
    coordinate: { latitude: 48.4781, longitude: -123.5447 },
    vibes: ['forest', 'views', 'quiet-roads'],
    approximateDistanceFromVictoria: 18,
    shortDescription: 'A deeper green escape into the hills above the Malahat.',
  },
  {
    id: 'island-view-beach',
    name: 'Island View Beach',
    coordinate: { latitude: 48.5702, longitude: -123.3689 },
    vibes: ['coast', 'quiet-roads', 'views'],
    approximateDistanceFromVictoria: 21,
    shortDescription: 'Wide beach horizons and an easy countryside approach.',
  },
  {
    id: 'beacon-hill-coffee',
    name: 'Beacon Hill Edge',
    coordinate: { latitude: 48.4128, longitude: -123.3625 },
    vibes: ['coffee', 'views', 'coast'],
    approximateDistanceFromVictoria: 2,
    shortDescription: 'A short scenic circuit with park edges and cafe energy.',
  },
];
