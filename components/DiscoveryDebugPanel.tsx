import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';
import type { DiscoveryDebugSummary } from '@/services/routeDiscovery';

type DiscoveryDebugPanelProps = {
  debug: DiscoveryDebugSummary | null;
};

/** Development-only discovery telemetry. Not shown in production builds. */
export function DiscoveryDebugPanel({ debug }: DiscoveryDebugPanelProps) {
  if (!__DEV__ || !debug) {
    return null;
  }

  return (
    <View style={styles.wrap} accessibilityLabel="Route discovery debug panel">
      <Text style={styles.title}>DEV · ROUTE DISCOVERY</Text>
      <Text style={styles.body}>{debug.summaryText}</Text>
      {debug.candidates.slice(0, 12).map((candidate) => (
        <Text
          key={`${candidate.name}-${candidate.straightLineKm}`}
          style={styles.row}
        >
          {`${candidate.accepted ? 'OK' : 'X'} ${candidate.name} · ${candidate.straightLineKm.toFixed(1)}km · ${
            candidate.osrmDurationMinutes != null
              ? `${candidate.osrmDurationMinutes.toFixed(0)}m`
              : 'no-osrm'
          }${candidate.rejectionReason ? ` · ${candidate.rejectionReason}` : ''}`}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  title: {
    ...typography.section,
    color: colors.accent,
  },
  body: {
    ...typography.helper,
    color: colors.text,
    textTransform: 'none',
  },
  row: {
    ...typography.helper,
    color: colors.textSecondary,
    textTransform: 'none',
    fontSize: 10,
    lineHeight: 14,
  },
});
