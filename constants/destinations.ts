import { VibeOption } from '@/constants/options';
import { LatLng } from '@/constants/routes';

export type DestinationCategory =
  | 'viewpoint'
  | 'beach'
  | 'park'
  | 'nature_reserve'
  | 'protected_area'
  | 'lake'
  | 'bay'
  | 'peak'
  | 'picnic_site'
  | 'attraction'
  | 'locality'
  | 'cafe'
  | 'scenic';

export type ScenicDestination = {
  id: string;
  name: string;
  coordinate: LatLng;
  category: DestinationCategory;
  vibes: Array<Exclude<VibeOption['id'], 'surprise'>>;
  shortDescription: string;
  source: 'curated' | 'overpass';
};
