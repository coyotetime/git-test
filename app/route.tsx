import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';
import { DiscoveryDebugPanel } from '@/components/DiscoveryDebugPanel';
import { NoDriveState } from '@/components/NoDriveState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RouteMap } from '@/components/RouteMap';
import { SearchingState } from '@/components/SearchingState';
import { SecondaryButton } from '@/components/SecondaryButton';
import { SectionHeading } from '@/components/SectionHeading';
import { StopList } from '@/components/StopList';
import { VibeTagList } from '@/components/VibeTagList';
import { DurationOption, VibeOption } from '@/constants/options';
import { colors, spacing, typography } from '@/constants/theme';
import { useScenicDrive } from '@/hooks/useScenicDrive';
import { useUserLocation } from '@/hooks/useUserLocation';
import {
  discoverNearbyDrive,
  DiscoveryDebugSummary,
  DiscoveryFailureReason,
} from '@/services/routeDiscovery';
import { GeneratedDrive } from '@/services/routeGeneration';

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

  const { drive: curatedDrive, isLoading, error, unavailable } = useScenicDrive({
    origin: location?.coordinate ?? null,
    originLabel: label,
    durationId,
    vibeId,
    enabled: Boolean(location),
  });

  const [discoveredDrive, setDiscoveredDrive] = useState<GeneratedDrive | null>(
    null,
  );
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryFailed, setDiscoveryFailed] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [discoveryReason, setDiscoveryReason] =
    useState<DiscoveryFailureReason | null>(null);
  const [discoveryDebug, setDiscoveryDebug] =
    useState<DiscoveryDebugSummary | null>(null);

  const drive = discoveredDrive ?? curatedDrive;
  const showCuratedEmpty =
    !isLoading && !error && unavailable && !discoveredDrive && !isDiscovering;
  const showDiscoveryEmpty =
    discoveryFailed && !isDiscovering && !discoveredDrive;
  const showEmpty = showCuratedEmpty || showDiscoveryEmpty;

  const handleFindNearby = async () => {
    if (!location || isDiscovering) {
      return;
    }

    setIsDiscovering(true);
    setDiscoveryFailed(false);
    setDiscoveryError(null);
    setDiscoveryReason(null);
    setDiscoveryDebug(null);

    try {
      const result = await discoverNearbyDrive({
        origin: location.coordinate,
        originLabel: label,
        durationId,
        vibeId,
      });

      setDiscoveryDebug(result.debug);

      if (result.status === 'ok') {
        setDiscoveredDrive(result.drive);
        setDiscoveryFailed(false);
        setDiscoveryReason(null);
        setDiscoveryError(null);
      } else {
        setDiscoveredDrive(null);
        setDiscoveryFailed(true);
        setDiscoveryReason(result.reason);
        setDiscoveryError(result.message);
        if (__DEV__) {
          console.log('[Scenic UI] discovery failure', result.reason, result.message);
          console.log(result.debug.summaryText);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong while searching nearby.';
      console.log('[Scenic UI] discovery threw', err instanceof Error ? err.message : err);
      setDiscoveredDrive(null);
      setDiscoveryFailed(true);
      setDiscoveryReason('overpass_error');
      setDiscoveryError(message);
    } finally {
      setIsDiscovering(false);
    }
  };

  const emptyTitle = showDiscoveryEmpty
    ? discoveryError ??
      `No good ${durationId}-minute drives found nearby.`
    : 'We don’t have a Scenic drive around here yet.';

  const emptyBody = showDiscoveryEmpty
    ? discoveryReason === 'routing_unreachable'
      ? discoveryDebug?.routingError
        ? `Routing error: ${discoveryDebug.routingError}`
        : 'Check your connection and try again.'
      : discoveryReason === 'overpass_error'
        ? discoveryDebug?.overpassError
          ? `Places error: ${discoveryDebug.overpassError}`
          : 'Places search failed. Try again in a moment.'
        : discoveryReason === 'no_fitting_route'
          ? 'Try a longer duration, or try again for a different nearby match.'
          : 'Try again, or choose a longer drive for a wider search.'
    : 'Try a longer drive, or let Scenic find something nearby.';

  return (
    <View style={styles.screen}>
      {!showEmpty && !isDiscovering ? (
        <View style={styles.mapBlock}>
          <RouteMap
            height={mapHeight}
            stops={drive?.stops ?? []}
            polyline={drive?.polyline ?? null}
            anchor={location?.coordinate ?? null}
            isLoading={isLoading || !location}
            error={error}
          />
          <View style={[styles.backWrap, { top: insets.top + spacing.sm }]}>
            <BackButton onPress={() => router.back()} />
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.noDriveHeader,
            { paddingTop: insets.top + spacing.sm },
          ]}
        >
          <BackButton onPress={() => router.back()} />
        </View>
      )}

      {isDiscovering ? (
        <SearchingState />
      ) : showEmpty ? (
        <NoDriveState
          title={emptyTitle}
          body={emptyBody}
          primaryLabel={
            showDiscoveryEmpty ? 'Try again' : 'Find something nearby'
          }
          onPrimaryPress={() => {
            void handleFindNearby();
          }}
          secondaryLabel="Choose a longer duration"
          onSecondaryPress={() => router.back()}
          debugPanel={
            showDiscoveryEmpty ? (
              <DiscoveryDebugPanel debug={discoveryDebug} />
            ) : null
          }
        />
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.details}>
              <Text style={styles.meta}>{`ROUTE // RESULT`}</Text>
              <Text style={styles.title}>
                {drive?.name ?? 'Finding your drive'}
              </Text>
              <View style={styles.accentRule} />
              <Text style={styles.stats}>
                {drive
                  ? `${drive.durationMinutes} MIN · ${drive.distanceKm} KM`
                  : isLoading
                    ? 'CALCULATING ROUTE…'
                    : 'ROUTE DETAILS UNAVAILABLE'}
              </Text>

              {drive ? <VibeTagList vibeIds={drive.vibeIds} /> : null}

              <Text style={styles.description}>
                {drive?.description ??
                  'Matching a scenic loop to your time, mood, and starting point.'}
              </Text>
            </View>

            {drive ? (
              <View style={styles.stopsSection}>
                <SectionHeading>Along the way</SectionHeading>
                <StopList stops={drive.stops} />
              </View>
            ) : null}

            {discoveredDrive ? (
              <DiscoveryDebugPanel debug={discoveryDebug} />
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, spacing.md) },
            ]}
          >
            <PrimaryButton
              label="Start drive"
              onPress={() => {}}
              disabled={!drive}
            />
            <SecondaryButton label="Save" onPress={() => {}} />
          </View>
        </>
      )}
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
  noDriveHeader: {
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  backWrap: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 3,
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
  accentRule: {
    height: 4,
    width: 56,
    backgroundColor: colors.accent,
  },
  stats: {
    ...typography.section,
    color: colors.textSecondary,
  },
  description: {
    ...typography.helper,
    color: colors.textSecondary,
  },
  stopsSection: {
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
});
