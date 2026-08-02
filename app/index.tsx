import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DurationSelector } from '@/components/DurationSelector';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SectionHeading } from '@/components/SectionHeading';
import { VibeChips } from '@/components/VibeChips';
import {
  DEFAULT_DURATION_ID,
  DURATION_OPTIONS,
  DurationOption,
  VIBE_OPTIONS,
  VibeOption,
} from '@/constants/options';
import { colors, spacing, typography } from '@/constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isCompact = height < 740;

  const [durationId, setDurationId] =
    useState<DurationOption['id']>(DEFAULT_DURATION_ID);
  const [vibeId, setVibeId] = useState<VibeOption['id'] | null>(null);

  const handleFindDrive = () => {
    // Placeholder for future routing / drive discovery flow.
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (isCompact ? spacing.md : spacing.xl),
            paddingBottom: insets.bottom + spacing.lg,
            gap: isCompact ? spacing.lg : spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        <View style={styles.header}>
          <Text style={styles.location}>Victoria, BC</Text>
          <Text style={styles.brand}>Scenic</Text>
          <Text style={styles.heading}>Where do you feel like going?</Text>
        </View>

        <View style={styles.durationSection}>
          <DurationSelector
            options={DURATION_OPTIONS}
            selectedId={durationId}
            onSelect={setDurationId}
          />
        </View>

        <View style={styles.vibeSection}>
          <SectionHeading>Pick a vibe</SectionHeading>
          <VibeChips
            options={VIBE_OPTIONS}
            selectedId={vibeId}
            onSelect={setVibeId}
          />
          <Text style={styles.helper}>
            We’ll match the drive to your mood and time
          </Text>
        </View>

        <View style={styles.cta}>
          <PrimaryButton label="Find me a drive" onPress={handleFindDrive} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  location: {
    ...typography.location,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  brand: {
    ...typography.brand,
    color: colors.primary,
  },
  heading: {
    ...typography.heading,
    color: colors.text,
    maxWidth: 300,
    marginTop: 2,
  },
  durationSection: {
    marginTop: spacing.xs,
  },
  vibeSection: {
    gap: spacing.md,
  },
  helper: {
    ...typography.helper,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cta: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});
