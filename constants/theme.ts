export const colors = {
  background: '#F5F0E6',
  surface: '#FFFBF5',
  surfaceMuted: '#EDE6D9',
  primary: '#1F3D2B',
  primarySoft: '#2F5740',
  primaryMuted: 'rgba(31, 61, 43, 0.12)',
  text: '#1C1A17',
  textSecondary: '#5C564C',
  textOnPrimary: '#FFFBF5',
  border: 'rgba(31, 61, 43, 0.08)',
  shadow: '#1C1A17',
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 14,
  md: 20,
  lg: 28,
  pill: 999,
} as const;

export const typography = {
  brand: {
    fontFamily: 'Fraunces_600SemiBold',
    fontSize: 42,
    letterSpacing: -0.8,
    lineHeight: 48,
  },
  heading: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 30,
    letterSpacing: -0.4,
    lineHeight: 38,
  },
  section: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'SourceSans3_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: 'SourceSans3_600SemiBold',
    fontSize: 16,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  button: {
    fontFamily: 'SourceSans3_700Bold',
    fontSize: 18,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
} as const;

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;
