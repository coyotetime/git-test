import { StyleSheet, Text, View } from 'react-native';

import { RouteStop } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

type StopListProps = {
  stops: RouteStop[];
};

export function StopList({ stops }: StopListProps) {
  return (
    <View style={styles.list}>
      {stops.map((stop, index) => {
        const isLast = index === stops.length - 1;

        return (
          <View key={stop.id} style={styles.row}>
            <View style={styles.rail}>
              <View style={styles.dot} />
              {!isLast && <View style={styles.line} />}
            </View>
            <Text style={styles.name}>{stop.name}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
    gap: spacing.md,
  },
  rail: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: colors.primary,
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: -4,
    backgroundColor: colors.primaryMuted,
  },
  name: {
    ...typography.helper,
    fontFamily: 'SourceSans3_600SemiBold',
    color: colors.text,
    paddingTop: 2,
    paddingBottom: spacing.md,
  },
});
