import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '@/constants/theme';

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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  index: {
    fontFamily: typography.chip.fontFamily,
    fontSize: 12,
    lineHeight: 14,
    color: colors.background,
  },
  stem: {
    width: 2,
    height: 8,
    backgroundColor: colors.primary,
  },
});
