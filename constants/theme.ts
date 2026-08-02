/**
 * Swiss Industrial Print — Scenic
 * Newsprint substrate, carbon ink, hazard-red accent.
 * No gradients, no soft shadows, no border radius.
 */
export const colors = {
  background: '#F4F4F0',
  surface: '#EAE8E3',
  surfaceWarm: '#EAE8E3',
  primary: '#111111',
  primarySoft: '#050505',
  primaryMuted: 'rgba(17, 17, 17, 0.08)',
  accent: '#E61919',
  text: '#111111',
  textSecondary: '#4A4A46',
  textOnPrimary: '#F4F4F0',
  surprise: '#F4F4F0',
  surpriseBorder: '#111111',
  border: '#111111',
  shadow: '#111111',
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const radii = {
  sm: 0,
  md: 0,
  lg: 0,
  xl: 0,
  pill: 0,
} as const;

export const typography = {
  location: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.2,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  brand: {
    fontFamily: 'ArchivoBlack_400Regular',
    fontSize: 56,
    letterSpacing: -2.2,
    lineHeight: 52,
    textTransform: 'uppercase' as const,
  },
  heading: {
    fontFamily: 'ArchivoBlack_400Regular',
    fontSize: 28,
    letterSpacing: -1,
    lineHeight: 30,
    textTransform: 'uppercase' as const,
  },
  section: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 1.4,
    lineHeight: 16,
    textTransform: 'uppercase' as const,
  },
  helper: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 18,
    textTransform: 'uppercase' as const,
  },
  durationValue: {
    fontFamily: 'ArchivoBlack_400Regular',
    fontSize: 42,
    letterSpacing: -1.8,
    lineHeight: 42,
  },
  durationUnit: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 1.4,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
  chip: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 0.8,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: 'ArchivoBlack_400Regular',
    fontSize: 16,
    letterSpacing: 0.8,
    lineHeight: 20,
    textTransform: 'uppercase' as const,
  },
} as const;

/** Shadows intentionally empty — industrial print uses hard edges only. */
export const shadows = {
  card: {},
  selected: {},
  button: {},
} as const;
