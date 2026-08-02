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
};
