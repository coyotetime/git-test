import { StyleSheet, Text, View } from 'react-native';

import { colors, shadows, typography } from '@/constants/theme';

type WaypointMarkerProps = {
  index: number;
};

export function WaypointMarker({ index }: WaypointMarkerProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.index}>{index}</Text>
      </View>
      <View style={styles.stem} />
      <View style={styles.dot} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  badge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.selected,
  },
  index: {
    fontFamily: typography.chip.fontFamily,
    fontSize: 13,
    lineHeight: 16,
    color: colors.textOnPrimary,
  },
  stem: {
    width: 2,
    height: 6,
    backgroundColor: colors.primary,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});
