import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VibeOption } from '@/constants/options';
import { colors, radii, shadows, spacing, typography } from '@/constants/theme';

type VibeGridProps = {
  options: VibeOption[];
  selectedId: VibeOption['id'] | null;
  onSelect: (id: VibeOption['id']) => void;
};

export function VibeGrid({ options, selectedId, onSelect }: VibeGridProps) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const selected = option.id === selectedId;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && styles.chipPressed,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  chipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primarySoft,
  },
  chipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  label: {
    ...typography.label,
    color: colors.text,
    textAlign: 'center',
  },
  labelSelected: {
    color: colors.primary,
  },
});
