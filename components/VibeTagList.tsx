import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { VIBE_OPTIONS, VibeOption } from '@/constants/options';
import { colors, radii, spacing, typography } from '@/constants/theme';

type VibeTagListProps = {
  vibeIds: VibeOption['id'][];
};

export function VibeTagList({ vibeIds }: VibeTagListProps) {
  const vibes = vibeIds
    .map((id) => VIBE_OPTIONS.find((option) => option.id === id))
    .filter((option): option is VibeOption => Boolean(option));

  return (
    <View style={styles.wrap}>
      {vibes.map((vibe) => (
        <View key={vibe.id} style={styles.tag}>
          <Ionicons name={vibe.icon} size={14} color={colors.primary} />
          <Text style={styles.label}>{vibe.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryMuted,
  },
  label: {
    ...typography.chip,
    color: colors.primary,
  },
});
