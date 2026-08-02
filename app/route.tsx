import { router, useLocalSearchParams } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RouteMap } from '@/components/RouteMap';
import { SecondaryButton } from '@/components/SecondaryButton';
import { SectionHeading } from '@/components/SectionHeading';
import { StopList } from '@/components/StopList';
import { VibeTagList } from '@/components/VibeTagList';
import { DurationOption, VibeOption } from '@/constants/options';
import { colors, spacing, typography } from '@/constants/theme';
import { useScenicDrive } from '@/hooks/useScenicDrive';
import { useUserLocation } from '@/hooks/useUserLocation';

function asDurationId(value: string | string[] | undefined): DurationOption['id'] {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === '60' || raw === '90' || raw === '30') {
    return raw;
  }
  return '30';
}

function asVibeId(
  value: string | string[] | undefined,
): VibeOption['id'] | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const allowed: VibeOption['id'][] = [
    'coast',
    'forest',
    'views',
    'quiet-roads',
    'coffee',
    'surprise',
  ];
  if (raw && allowed.includes(raw as VibeOption['id'])) {
    return raw as VibeOption['id'];
  }
  return 'surprise';
}

export default function RouteResultScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isCompact = height < 740;
  const mapHeight = Math.round(height * (isCompact ? 0.32 : 0.38));
  const params = useLocalSearchParams<{
    durationId?: string;
    vibeId?: string;
  }>();

  const durationId = asDurationId(params.durationId);
  const vibeId = asVibeId(params.vibeId);
  const { location, label } = useUserLocation();

  const { drive, isLoading, error } = useScenicDrive({
    origin: location?.coordinate ?? null,
    originLabel: label,
    durationId,
    vibeId,
    enabled: Boolean(location),
  });

  const stops = drive?.stops ?? [];
  const title = drive?.name ?? 'Finding your drive';
  const description =
    drive?.description ??
    'Matching a scenic loop to your time, mood, and starting point.';

  return (
    <View style={styles.screen}>
      <View style={styles.mapBlock}>
        <RouteMap
          height={mapHeight}
          stops={stops}
          polyline={drive?.polyline ?? null}
          isLoading={isLoading || !location}
          error={error}
        />
        <View style={[styles.backWrap, { top: insets.top + spacing.sm }]}>
          <BackButton onPress={() => router.back()} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.details}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.meta}>
            {drive
              ? `${drive.durationMinutes} min · ${drive.distanceKm} km`
              : isLoading
                ? 'Calculating route…'
                : 'Route details unavailable'}
          </Text>

          {drive ? <VibeTagList vibeIds={drive.vibeIds} /> : null}

          <Text style={styles.description}>{description}</Text>
        </View>

        {drive ? (
          <View style={styles.stopsSection}>
            <SectionHeading>Along the way</SectionHeading>
            <StopList stops={drive.stops} />
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <PrimaryButton label="Start drive" onPress={() => {}} disabled={!drive} />
        <SecondaryButton label="Save" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapBlock: {
    position: 'relative',
  },
  backWrap: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  details: {
    gap: spacing.md,
  },
  title: {
    ...typography.heading,
    fontSize: 32,
    lineHeight: 38,
    color: colors.text,
  },
  meta: {
    ...typography.section,
    color: colors.textSecondary,
  },
  description: {
    ...typography.helper,
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  stopsSection: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(28, 26, 23, 0.06)',
  },
});
