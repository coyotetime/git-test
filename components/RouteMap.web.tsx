import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { LatLng, RouteStop } from '@/constants/routes';
import { colors, radii, shadows, spacing, typography } from '@/constants/theme';

type RouteMapProps = {
  height: number;
  stops: RouteStop[];
  polyline: LatLng[] | null;
  isLoading?: boolean;
  error?: string | null;
};

export function RouteMap({
  height,
  polyline,
  isLoading = false,
  error = null,
}: RouteMapProps) {
  return (
    <View style={[styles.container, { height }, shadows.card]}>
      {isLoading ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.overlayText}>Mapping your drive…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>Route unavailable</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && polyline ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            Drive mapped · {polyline.length} points
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#D5DED4',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  overlayText: {
    ...typography.helper,
    color: colors.primary,
    textAlign: 'center',
  },
  errorTitle: {
    ...typography.section,
    color: colors.primary,
    textAlign: 'center',
  },
  errorBody: {
    ...typography.helper,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
