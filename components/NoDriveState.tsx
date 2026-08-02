import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { colors, spacing, typography } from '@/constants/theme';

type NoDriveStateProps = {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  primaryDisabled?: boolean;
  debugPanel?: ReactNode;
};

export function NoDriveState({
  title,
  body,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  primaryDisabled = false,
  debugPanel = null,
}: NoDriveStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.meta}>{`REV / NO-ROUTE`}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rule} />
      <Text style={styles.body}>{body}</Text>
      <PrimaryButton
        label={primaryLabel}
        onPress={onPrimaryPress}
        disabled={primaryDisabled}
      />
      {secondaryLabel && onSecondaryPress ? (
        <SecondaryButton label={secondaryLabel} onPress={onSecondaryPress} />
      ) : null}
      {debugPanel}
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
  meta: {
    ...typography.section,
    color: colors.accent,
  },
  title: {
    ...typography.heading,
    fontSize: 32,
    lineHeight: 34,
    color: colors.text,
  },
  rule: {
    height: 4,
    backgroundColor: colors.accent,
    marginVertical: spacing.xs,
  },
  body: {
    ...typography.helper,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
});
