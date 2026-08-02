import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VibeOption } from '@/constants/options';
import { colors, spacing, typography } from '@/constants/theme';
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
  const isSurprise = option.accent === 'surprise';
  const iconColor = selected ? colors.background : colors.text;
  const labelColor = selected ? colors.background : colors.text;

  return (
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
      <Text style={styles.bracket}>[</Text>
      <Ionicons name={option.icon} size={14} color={iconColor} />
      <Text style={[styles.label, { color: labelColor }]}>{option.label}</Text>
      <Text style={styles.bracket}>]</Text>
    </Pressable>
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
    gap: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipSurprise: {
    borderStyle: 'dashed',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.85,
  },
  bracket: {
    ...typography.chip,
    color: colors.accent,
  },
  label: {
    ...typography.chip,
  },
});
