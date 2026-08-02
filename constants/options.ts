import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type DurationOption = {
  id: '30' | '60' | '90';
  minutes: number;
  unit: string;
};

export type VibeOption = {
  id: 'coast' | 'forest' | 'views' | 'quiet-roads' | 'coffee' | 'surprise';
  label: string;
  icon: IconName;
  accent?: 'surprise';
};

export const DURATION_OPTIONS: DurationOption[] = [
  { id: '30', minutes: 30, unit: 'min' },
  { id: '60', minutes: 60, unit: 'min' },
  { id: '90', minutes: 90, unit: 'min' },
];

export const VIBE_OPTIONS: VibeOption[] = [
  { id: 'coast', label: 'Coast', icon: 'water-outline' },
  { id: 'forest', label: 'Forest', icon: 'leaf-outline' },
  { id: 'views', label: 'Views', icon: 'partly-sunny-outline' },
  { id: 'quiet-roads', label: 'Quiet Roads', icon: 'trail-sign-outline' },
  { id: 'coffee', label: 'Coffee', icon: 'cafe-outline' },
  { id: 'surprise', label: 'Surprise Me', icon: 'sparkles-outline', accent: 'surprise' },
];

export const DEFAULT_DURATION_ID: DurationOption['id'] = '30';
