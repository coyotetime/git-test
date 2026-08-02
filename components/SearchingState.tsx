import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

const MESSAGES = [
  'Finding a good road…',
  'Looking for the scenic way…',
  'Checking nearby roads…',
  'Finding somewhere worth driving…',
];

export function SearchingState() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.title}>{MESSAGES[index]}</Text>
      <Text style={styles.body}>
        Scenic is checking nearby places and real drive times.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    ...typography.heading,
    fontSize: 28,
    lineHeight: 34,
    color: colors.text,
    marginTop: spacing.sm,
  },
  body: {
    ...typography.helper,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
});
