import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DurationOption } from '@/constants/options';
import { colors, radii, shadows, spacing, typography } from '@/constants/theme';

type DurationSelectorProps = {
  options: DurationOption[];
  selectedId: DurationOption['id'];
  onSelect: (id: DurationOption['id']) => void;
};

export function DurationSelector({
  options,
  selectedId,
  onSelect,
}: DurationSelectorProps) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const selected = option.id === selectedId;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.optionSelected,
              pressed && styles.optionPressed,
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  label: {
    ...typography.label,
    color: colors.primary,
  },
  labelSelected: {
    color: colors.textOnPrimary,
  },
});
