import { router } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/BackButton';
import { MapPlaceholder } from '@/components/MapPlaceholder';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { SectionHeading } from '@/components/SectionHeading';
import { StopList } from '@/components/StopList';
import { VibeTagList } from '@/components/VibeTagList';
import { SAMPLE_ROUTE } from '@/constants/routes';
import { colors, spacing, typography } from '@/constants/theme';

export default function RouteResultScreen() {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const mapHeight = Math.round(height * 0.4);
  const route = SAMPLE_ROUTE;

  return (
    <View style={styles.screen}>
      <View style={styles.mapBlock}>
        <MapPlaceholder height={mapHeight} />
        <View style={[styles.backWrap, { top: insets.top + spacing.sm }]}>
          <BackButton onPress={() => router.back()} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.details}>
          <Text style={styles.title}>{route.name}</Text>
          <Text style={styles.meta}>
            {route.durationMinutes} min · {route.distanceKm} km
          </Text>

          <VibeTagList vibeIds={route.vibeIds} />

          <Text style={styles.description}>{route.description}</Text>
        </View>

        <View style={styles.stopsSection}>
          <SectionHeading>Along the way</SectionHeading>
          <StopList stops={route.stops} />
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Start drive" onPress={() => {}} />
          <SecondaryButton label="Save" onPress={() => {}} />
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
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.xl,
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
  actions: {
    marginTop: 'auto',
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
});
