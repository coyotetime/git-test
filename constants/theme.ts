export const colors = {
  background: '#F5F0E6',
  surface: '#FFFDF8',
  surfaceWarm: '#F8F2E8',
  primary: '#1F3D2B',
  primarySoft: '#2F5740',
  primaryMuted: 'rgba(31, 61, 43, 0.10)',
  text: '#1C1A17',
  textSecondary: '#7A746A',
  textOnPrimary: '#FFFDF8',
  surprise: 'rgba(31, 61, 43, 0.06)',
  surpriseBorder: 'rgba(31, 61, 43, 0.22)',
  shadow: '#1C1A17',
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
  sm: 14,
  md: 22,
  lg: 28,
  xl: 32,
  pill: 999,
} as const;

export const typography = {
  location: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.8,
    lineHeight: 18,
    textTransform: 'uppercase' as const,
  },
  brand: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 40,
    letterSpacing: -0.9,
    lineHeight: 44,
  },
  heading: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 28,
    letterSpacing: -0.4,
    lineHeight: 36,
  },
  section: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 17,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  helper: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  durationValue: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 36,
    letterSpacing: -1,
    lineHeight: 40,
  },
  durationUnit: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 13,
    letterSpacing: 0.4,
    lineHeight: 18,
  },
  chip: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  button: {
    fontFamily: 'SourceSans3_700Bold',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
  },
  selected: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 5,
  },
} as const;
