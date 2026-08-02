import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { DurationOption } from '@/constants/options';
import { colors, spacing, typography } from '@/constants/theme';
import { selectionHaptic } from '@/utils/haptics';

type DurationSelectorProps = {
  options: DurationOption[];
  selectedId: DurationOption['id'];
  onSelect: (id: DurationOption['id']) => void;
};

type DurationCardProps = {
  option: DurationOption;
  selected: boolean;
  onSelect: (id: DurationOption['id']) => void;
};

function DurationCard({ option, selected, onSelect }: DurationCardProps) {
  const opacity = useSharedValue(selected ? 1 : 0.88);

  useEffect(() => {
    opacity.value = withTiming(selected ? 1 : 0.88, { duration: 120 });
  }, [opacity, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.cardWrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${option.minutes} minutes`}
        onPress={() => {
          if (!selected) {
            selectionHaptic();
          }
          onSelect(option.id);
        }}
        style={({ pressed }) => [
          styles.card,
          selected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
      >
        <Text style={[styles.value, selected && styles.valueSelected]}>
          {option.minutes}
        </Text>
        <Text style={[styles.unit, selected && styles.unitSelected]}>
          {option.unit}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function DurationSelector({
  options,
  selectedId,
  onSelect,
}: DurationSelectorProps) {
  return (
    <View style={styles.row}>
      {options.map((option) => (
        <DurationCard
          key={option.id}
          option={option}
          selected={option.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.border,
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 128,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
  },
  cardSelected: {
    backgroundColor: colors.accent,
  },
  cardPressed: {
    opacity: 0.9,
  },
  value: {
    ...typography.durationValue,
    color: colors.text,
  },
  valueSelected: {
    color: colors.background,
  },
  unit: {
    ...typography.durationUnit,
    marginTop: 6,
    color: colors.textSecondary,
  },
  unitSelected: {
    color: colors.background,
  },
});
