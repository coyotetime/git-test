import { StyleSheet, Text, View } from 'react-native';

import { VIBE_OPTIONS, VibeOption } from '@/constants/options';
import { colors, spacing, typography } from '@/constants/theme';

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
          <Text style={styles.label}>{`< ${vibe.label} >`}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  label: {
    ...typography.chip,
    color: colors.text,
  },
});
