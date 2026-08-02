import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { LatLng, RouteStop } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

type RouteMapProps = {
  height: number;
  stops: RouteStop[];
  polyline: LatLng[] | null;
  anchor?: LatLng | null;
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
    <View style={[styles.container, { height }]}>
      <View style={styles.frame}>
        <Text style={styles.frameLabel}>{`+-- MAP / FIELD --+`}</Text>
      </View>

      {isLoading ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.overlayText}>{`STATUS // MAPPING`}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>{`ERR / ROUTE`}</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : null}

      {!isLoading && !error && polyline ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            {`DRIVE MAPPED · ${polyline.length} PTS`}
          </Text>
        </View>
      ) : null}

      {!isLoading && !error && !polyline ? (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{`RENDER TARGET / WEB`}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  frame: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  frameLabel: {
    ...typography.section,
    color: colors.text,
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
    color: colors.accent,
    textAlign: 'center',
  },
  errorBody: {
    ...typography.helper,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
