import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '404', headerShown: true }} />
      <View style={styles.container}>
        <Text style={styles.meta}>{`ERR / 404`}</Text>
        <Text style={styles.title}>This screen does not exist.</Text>
        <View style={styles.rule} />
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{`>>> GO HOME`}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  meta: {
    ...typography.section,
    color: colors.accent,
  },
  title: {
    ...typography.heading,
    color: colors.text,
  },
  rule: {
    height: 4,
    width: 56,
    backgroundColor: colors.accent,
  },
  link: {
    paddingVertical: spacing.sm,
  },
  linkText: {
    ...typography.button,
    color: colors.text,
  },
});
