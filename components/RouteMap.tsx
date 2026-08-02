import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';

import { WaypointMarker } from '@/components/WaypointMarker';
import { LatLng, RouteStop } from '@/constants/routes';
import { colors, radii, shadows, spacing, typography } from '@/constants/theme';

type RouteMapProps = {
  height: number;
  stops: RouteStop[];
  polyline: LatLng[] | null;
  /** Used for the initial camera when stops/polyline are not ready yet. */
  anchor?: LatLng | null;
  isLoading?: boolean;
  error?: string | null;
};

function getInitialRegion(points: LatLng[]): Region {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.35, 0.018),
    longitudeDelta: Math.max((maxLng - minLng) * 1.35, 0.018),
  };
}

export function RouteMap({
  height,
  stops,
  polyline,
  anchor = null,
  isLoading = false,
  error = null,
}: RouteMapProps) {
  const mapRef = useRef<MapView>(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  const fallbackPoints = useMemo(() => {
    if (stops.length > 0) {
      return stops.map((stop) => stop.coordinate);
    }
    if (anchor) {
      return [anchor];
    }
    return [{ latitude: 49.0, longitude: -123.8 }];
  }, [anchor, stops]);
  const initialRegion = useMemo(
    () => getInitialRegion(polyline && polyline.length > 0 ? polyline : fallbackPoints),
    [fallbackPoints, polyline],
  );

  useEffect(() => {
    if (!polyline || polyline.length === 0) {
      return;
    }

    const fitTimer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(polyline, {
        edgePadding: {
          top: 56,
          right: 32,
          bottom: 32,
          left: 32,
        },
        animated: true,
      });
    }, 250);

    const trackTimer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 800);

    return () => {
      clearTimeout(fitTimer);
      clearTimeout(trackTimer);
    };
  }, [polyline]);

  return (
    <View style={[styles.container, { height }, shadows.card]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={!isLoading && !error}
        zoomEnabled={!isLoading && !error}
      >
        {polyline ? (
          <Polyline
            coordinates={polyline}
            strokeColor={colors.primary}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}

        {stops.map((stop, index) => (
          <Marker
            key={`${stop.id}-${index}`}
            coordinate={stop.coordinate}
            title={stop.name}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={tracksViewChanges}
          >
            <WaypointMarker index={index + 1} />
          </Marker>
        ))}
      </MapView>

      {isLoading ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.overlayText}>Mapping your drive…</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>Route unavailable</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#DCE3D8',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(245, 240, 230, 0.72)',
  },
  overlayText: {
    ...typography.helper,
    color: colors.primary,
  },
  errorTitle: {
    ...typography.section,
    color: colors.primary,
    textAlign: 'center',
  },
  errorBody: {
    ...typography.helper,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
