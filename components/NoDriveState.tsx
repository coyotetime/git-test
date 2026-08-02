import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing, typography } from '@/constants/theme';

type NoDriveStateProps = {
  onFindNearby?: () => void;
};

export function NoDriveState({ onFindNearby }: NoDriveStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>We don’t have a Scenic drive around here yet.</Text>
      <Text style={styles.body}>
        Try a longer drive, or let Scenic find something nearby.
      </Text>
      <PrimaryButton
        label="Find something nearby"
        onPress={onFindNearby ?? (() => {})}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.heading,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
  },
  body: {
    ...typography.helper,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
