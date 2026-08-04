import { router } from 'expo-router';
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
import { useUserLocation } from '@/hooks/useUserLocation';
import { getUserLocation } from '@/services/location';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isCompact = height < 740;
  const { label: locationLabel } = useUserLocation();

  const [durationId, setDurationId] =
    useState<DurationOption['id']>(DEFAULT_DURATION_ID);
  const [vibeId, setVibeId] = useState<VibeOption['id'] | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleFindDrive = async () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);
    try {
      await getUserLocation({ forceRefresh: true });
      router.push({
        pathname: '/route',
        params: {
          durationId,
          vibeId: vibeId ?? 'surprise',
        },
      });
    } finally {
      setIsStarting(false);
    }
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
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{`LOC // ${locationLabel}`}</Text>
          <Text style={styles.meta}>{`UNIT / D-01`}</Text>
        </View>

        <View style={styles.header}>
          <View style={styles.brandStamp} accessibilityRole="header">
            <Text style={styles.brandStampMeta}>{`REV / MARK`}</Text>
            <Text style={styles.brand}>Scenic</Text>
          </View>
          <View style={styles.accentRule} />
          <Text style={styles.heading}>Where do you feel like going?</Text>
        </View>

        <View style={styles.durationSection}>
          <Text style={styles.sectionMeta}>{`[ DURATION SELECT ]`}</Text>
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
          <PrimaryButton
            label={isStarting ? 'Finding a drive…' : 'Find me a drive'}
            onPress={() => {
              void handleFindDrive();
            }}
            disabled={isStarting}
          />
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  meta: {
    ...typography.location,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  header: {
    gap: spacing.md,
  },
  brandStamp: {
    alignSelf: 'stretch',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  brandStampMeta: {
    ...typography.section,
    color: colors.accent,
  },
  brand: {
    ...typography.brand,
    fontSize: 64,
    lineHeight: 56,
    letterSpacing: -2.8,
    color: colors.text,
  },
  accentRule: {
    height: 8,
    width: 96,
    backgroundColor: colors.accent,
  },
  heading: {
    ...typography.heading,
    color: colors.text,
    maxWidth: 340,
  },
  durationSection: {
    gap: spacing.sm,
  },
  sectionMeta: {
    ...typography.section,
    color: colors.accent,
  },
  vibeSection: {
    gap: spacing.md,
  },
  helper: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  cta: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});
