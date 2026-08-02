import { StyleSheet, Text, View } from 'react-native';

import { RouteStop } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

type StopListProps = {
  stops: RouteStop[];
};

export function StopList({ stops }: StopListProps) {
  return (
    <View style={styles.list}>
      {stops.map((stop, index) => (
        <View key={stop.id} style={styles.row}>
          <Text style={styles.index}>{String(index + 1).padStart(2, '0')}</Text>
          <Text style={styles.name}>{stop.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderWidth: 2,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  index: {
    ...typography.section,
    color: colors.accent,
  },
  name: {
    ...typography.helper,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.sm,
  },
});
