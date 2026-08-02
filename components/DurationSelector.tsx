import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { DurationOption } from '@/constants/options';
import { colors, radii, shadows, spacing, typography } from '@/constants/theme';
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
  const scale = useSharedValue(selected ? 1.02 : 1);
  const opacity = useSharedValue(selected ? 1 : 0.92);

  useEffect(() => {
    scale.value = withTiming(selected ? 1.02 : 1, { duration: 180 });
    opacity.value = withTiming(selected ? 1 : 0.92, { duration: 180 });
  }, [opacity, scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
    gap: spacing.sm,
  },
  cardWrap: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 132,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  cardSelected: {
    backgroundColor: colors.primary,
    ...shadows.selected,
  },
  cardPressed: {
    opacity: 0.94,
  },
  value: {
    ...typography.durationValue,
    color: colors.primary,
  },
  valueSelected: {
    color: colors.textOnPrimary,
  },
  unit: {
    ...typography.durationUnit,
    marginTop: 4,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  unitSelected: {
    color: 'rgba(255, 253, 248, 0.78)',
  },
});
