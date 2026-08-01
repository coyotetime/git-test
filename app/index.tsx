import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DurationSelector } from '@/components/DurationSelector';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeading } from '@/components/SectionHeading';
import { VibeGrid } from '@/components/VibeGrid';
import {
  DEFAULT_DURATION_ID,
  DURATION_OPTIONS,
  DurationOption,
  VIBE_OPTIONS,
  VibeOption,
} from '@/constants/options';
import { colors, spacing, typography } from '@/constants/theme';

export default function HomeScreen() {
  const [durationId, setDurationId] =
    useState<DurationOption['id']>(DEFAULT_DURATION_ID);
  const [vibeId, setVibeId] = useState<VibeOption['id'] | null>(null);

  const handleFindDrive = () => {
    // Placeholder for future routing / drive discovery flow.
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>Scenic</Text>
          <Text style={styles.heading}>Where do you feel like going?</Text>
        </View>

        <View style={styles.section}>
          <DurationSelector
            options={DURATION_OPTIONS}
            selectedId={durationId}
            onSelect={setDurationId}
          />
        </View>

        <View style={styles.section}>
          <SectionHeading>Pick a vibe</SectionHeading>
          <VibeGrid
            options={VIBE_OPTIONS}
            selectedId={vibeId}
            onSelect={setVibeId}
          />
        </View>

        <View style={styles.cta}>
          <PrimaryButton label="Find me a drive" onPress={handleFindDrive} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  brand: {
    ...typography.brand,
    color: colors.primary,
  },
  heading: {
    ...typography.heading,
    color: colors.text,
    maxWidth: 320,
  },
  section: {
    gap: spacing.md,
  },
  cta: {
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
});
