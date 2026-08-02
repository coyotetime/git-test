import { ScenicDestination } from '@/constants/destinations';

/**
 * Curated scenic destinations.
 * Availability is always evaluated relative to the user's current location.
 */
export const SCENIC_WAYPOINTS: ScenicDestination[] = [
  {
    id: 'dallas-road',
    name: 'Dallas Road',
    coordinate: { latitude: 48.4069, longitude: -123.3681 },
    category: 'scenic',
    vibes: ['coast', 'views'],
    shortDescription: 'Open water views along Victoria’s southern shoreline.',
    source: 'curated',
  },
  {
    id: 'cattle-point',
    name: 'Cattle Point',
    coordinate: { latitude: 48.4275, longitude: -123.2947 },
    category: 'viewpoint',
    vibes: ['coast', 'views', 'quiet-roads'],
    shortDescription: 'Rocky shoreline lookouts on the edge of Oak Bay.',
    source: 'curated',
  },
  {
    id: 'esquimalt-lagoon',
    name: 'Esquimalt Lagoon',
    coordinate: { latitude: 48.42528, longitude: -123.46376 },
    category: 'beach',
    vibes: ['coast', 'views', 'quiet-roads'],
    shortDescription: 'A calm lagoon drive with beach stops and sea air.',
    source: 'curated',
  },
  {
    id: 'mount-douglas',
    name: 'Mount Douglas',
    coordinate: { latitude: 48.4928, longitude: -123.3447 },
    category: 'viewpoint',
    vibes: ['views', 'forest', 'quiet-roads'],
    shortDescription: 'Tree-lined roads up to one of the city’s best lookouts.',
    source: 'curated',
  },
  {
    id: 'cordova-bay',
    name: 'Cordova Bay',
    coordinate: { latitude: 48.5165, longitude: -123.3588 },
    category: 'beach',
    vibes: ['coast', 'quiet-roads', 'coffee'],
    shortDescription: 'A softer coastal loop with room to pause and wander.',
    source: 'curated',
  },
  {
    id: 'thetis-lake',
    name: 'Thetis Lake',
    coordinate: { latitude: 48.4689, longitude: -123.4682 },
    category: 'lake',
    vibes: ['forest', 'quiet-roads'],
    shortDescription: 'Shaded park roads and a classic west-shore forest pause.',
    source: 'curated',
  },
  {
    id: 'goldstream',
    name: 'Goldstream',
    coordinate: { latitude: 48.4781, longitude: -123.5447 },
    category: 'nature_reserve',
    vibes: ['forest', 'views', 'quiet-roads'],
    shortDescription: 'A deeper green escape into the hills above the Malahat.',
    source: 'curated',
  },
  {
    id: 'island-view-beach',
    name: 'Island View Beach',
    coordinate: { latitude: 48.5702, longitude: -123.3689 },
    category: 'beach',
    vibes: ['coast', 'quiet-roads', 'views'],
    shortDescription: 'Wide beach horizons and an easy countryside approach.',
    source: 'curated',
  },
  {
    id: 'beacon-hill-coffee',
    name: 'Beacon Hill Edge',
    coordinate: { latitude: 48.4128, longitude: -123.3625 },
    category: 'park',
    vibes: ['coffee', 'views', 'coast'],
    shortDescription: 'A short scenic circuit with park edges and cafe energy.',
    source: 'curated',
  },
];
