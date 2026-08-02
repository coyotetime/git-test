import { DurationOption } from '@/constants/options';

export type DurationWindow = {
  targetMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  /** Preliminary Haversine one-way distance filter, in km. */
  maxStraightLineKm: number;
  /** Overpass search radius, in meters. */
  searchRadiusMeters: number;
};

export function getDurationWindow(
  durationId: DurationOption['id'],
): DurationWindow {
  switch (durationId) {
    case '30':
      return {
        targetMinutes: 30,
        minMinutes: 20,
        maxMinutes: 40,
        maxStraightLineKm: 15,
        searchRadiusMeters: 15_000,
      };
    case '60':
      return {
        targetMinutes: 60,
        minMinutes: 45,
        maxMinutes: 75,
        maxStraightLineKm: 30,
        searchRadiusMeters: 25_000,
      };
    case '90':
      return {
        targetMinutes: 90,
        minMinutes: 70,
        maxMinutes: 110,
        maxStraightLineKm: 50,
        searchRadiusMeters: 42_500,
      };
    default:
      return {
        targetMinutes: 30,
        minMinutes: 20,
        maxMinutes: 40,
        maxStraightLineKm: 15,
        searchRadiusMeters: 15_000,
      };
  }
}
