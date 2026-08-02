import { StyleSheet, View } from 'react-native';

import { LatLng, RouteStop } from '@/constants/routes';
import { radii, shadows } from '@/constants/theme';

type RouteMapProps = {
  height: number;
  stops: RouteStop[];
  polyline: LatLng[];
};

export function RouteMap({ height }: RouteMapProps) {
  return <View style={[styles.container, styles.webFallback, { height }, shadows.card]} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  webFallback: {
    backgroundColor: '#D5DED4',
  },
});
