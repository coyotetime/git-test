export type DurationOption = {
  id: '30' | '60' | '90';
  label: string;
  minutes: number;
};

export type VibeOption = {
  id: 'coast' | 'forest' | 'views' | 'quiet-roads' | 'coffee' | 'surprise';
  label: string;
};

export const DURATION_OPTIONS: DurationOption[] = [
  { id: '30', label: '30 min', minutes: 30 },
  { id: '60', label: '60 min', minutes: 60 },
  { id: '90', label: '90 min', minutes: 90 },
];

export const VIBE_OPTIONS: VibeOption[] = [
  { id: 'coast', label: 'Coast' },
  { id: 'forest', label: 'Forest' },
  { id: 'views', label: 'Views' },
  { id: 'quiet-roads', label: 'Quiet Roads' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'surprise', label: 'Surprise Me' },
];

export const DEFAULT_DURATION_ID: DurationOption['id'] = '30';
