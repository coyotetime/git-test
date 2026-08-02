import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
      <Text style={styles.meta}>{`STATUS // SCANNING`}</Text>
      <Text style={styles.title}>{MESSAGES[index]}</Text>
      <View style={styles.barTrack}>
        <View style={styles.barFill} />
      </View>
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
  meta: {
    ...typography.section,
    color: colors.accent,
  },
  title: {
    ...typography.heading,
    fontSize: 30,
    lineHeight: 32,
    color: colors.text,
  },
  barTrack: {
    width: '100%',
    height: 8,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  barFill: {
    width: '62%',
    height: '100%',
    backgroundColor: colors.accent,
  },
  body: {
    ...typography.helper,
    color: colors.textSecondary,
  },
});
