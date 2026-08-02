import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { VibeOption } from '@/constants/options';
import { colors, radii, shadows, spacing, typography } from '@/constants/theme';
import { selectionHaptic } from '@/utils/haptics';

type VibeChipsProps = {
  options: VibeOption[];
  selectedId: VibeOption['id'] | null;
  onSelect: (id: VibeOption['id']) => void;
};

type VibeChipProps = {
  option: VibeOption;
  selected: boolean;
  onSelect: (id: VibeOption['id']) => void;
};

function VibeChip({ option, selected, onSelect }: VibeChipProps) {
  const scale = useSharedValue(selected ? 1.03 : 1);
  const isSurprise = option.accent === 'surprise';

  useEffect(() => {
    scale.value = withTiming(selected ? 1.03 : 1, { duration: 160 });
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = selected
    ? colors.textOnPrimary
    : isSurprise
      ? colors.primarySoft
      : colors.primary;

  const labelColor = selected
    ? colors.textOnPrimary
    : isSurprise
      ? colors.primary
      : colors.text;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        onPress={() => {
          if (!selected) {
            selectionHaptic();
          }
          onSelect(option.id);
        }}
        style={({ pressed }) => [
          styles.chip,
          isSurprise && styles.chipSurprise,
          selected && styles.chipSelected,
          pressed && styles.chipPressed,
        ]}
      >
        <Ionicons name={option.icon} size={16} color={iconColor} />
        <Text style={[styles.label, { color: labelColor }]}>{option.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function VibeChips({ options, selectedId, onSelect }: VibeChipsProps) {
  return (
    <View style={styles.wrap}>
      {options.map((option) => (
        <VibeChip
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
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  chipSurprise: {
    backgroundColor: colors.surprise,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.surpriseBorder,
    borderStyle: 'dashed',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderWidth: 0,
    ...shadows.selected,
  },
  chipPressed: {
    opacity: 0.92,
  },
  label: {
    ...typography.chip,
  },
});
