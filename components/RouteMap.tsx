import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';

import { LatLng, RouteStop } from '@/constants/routes';
import { colors, radii, shadows } from '@/constants/theme';

type RouteMapProps = {
  height: number;
  stops: RouteStop[];
  polyline: LatLng[];
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
    latitudeDelta: Math.max((maxLat - minLat) * 1.8, 0.03),
    longitudeDelta: Math.max((maxLng - minLng) * 1.8, 0.03),
  };
}

export function RouteMap({ height, stops, polyline }: RouteMapProps) {
  const mapRef = useRef<MapView>(null);
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const fitPoints = useMemo(
    () => (polyline.length > 0 ? polyline : stops.map((stop) => stop.coordinate)),
    [polyline, stops],
  );
  const initialRegion = useMemo(() => getInitialRegion(fitPoints), [fitPoints]);

  useEffect(() => {
    if (fitPoints.length === 0) {
      return;
    }

    const fitTimer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(fitPoints, {
        edgePadding: {
          top: 72,
          right: 48,
          bottom: 48,
          left: 48,
        },
        animated: true,
      });
    }, 250);

    const trackTimer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 750);

    return () => {
      clearTimeout(fitTimer);
      clearTimeout(trackTimer);
    };
  }, [fitPoints]);

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
        scrollEnabled
        zoomEnabled
      >
        <Polyline
          coordinates={polyline}
          strokeColor={colors.primary}
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />

        {stops.map((stop) => (
          <Marker
            key={stop.id}
            coordinate={stop.coordinate}
            title={stop.name}
            tracksViewChanges={tracksViewChanges}
          >
            <View style={styles.markerOuter}>
              <View style={styles.markerInner} />
            </View>
          </Marker>
        ))}
      </MapView>
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
  markerOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  markerInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
