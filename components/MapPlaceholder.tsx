import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors, radii, shadows } from '@/constants/theme';

type MapPlaceholderProps = {
  height?: number;
};

export function MapPlaceholder({ height }: MapPlaceholderProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const mapHeight = height ?? Math.round(windowHeight * 0.4);
  const mapWidth = windowWidth;

  return (
    <View style={[styles.container, { height: mapHeight }, shadows.card]}>
      <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
        <Rect width={mapWidth} height={mapHeight} fill="#DCE3D8" />

        {/* Soft terrain blocks */}
        <Path
          d={`M ${mapWidth * 0.05} ${mapHeight * 0.72}
              C ${mapWidth * 0.25} ${mapHeight * 0.58}, ${mapWidth * 0.4} ${mapHeight * 0.8}, ${mapWidth * 0.62} ${mapHeight * 0.68}
              S ${mapWidth * 0.9} ${mapHeight * 0.86}, ${mapWidth} ${mapHeight * 0.74}
              L ${mapWidth} ${mapHeight}
              L 0 ${mapHeight}
              Z`}
          fill="#C9D5C8"
          opacity={0.7}
        />
        <Path
          d={`M 0 ${mapHeight * 0.18}
              C ${mapWidth * 0.22} ${mapHeight * 0.08}, ${mapWidth * 0.38} ${mapHeight * 0.28}, ${mapWidth * 0.58} ${mapHeight * 0.14}
              S ${mapWidth * 0.88} ${mapHeight * 0.05}, ${mapWidth} ${mapHeight * 0.2}
              L ${mapWidth} 0
              L 0 0
              Z`}
          fill="#CBD8CF"
          opacity={0.55}
        />

        {/* Water suggestion */}
        <Path
          d={`M ${mapWidth * 0.55} ${mapHeight * 0.42}
              C ${mapWidth * 0.68} ${mapHeight * 0.3}, ${mapWidth * 0.82} ${mapHeight * 0.36}, ${mapWidth * 0.96} ${mapHeight * 0.28}
              L ${mapWidth} ${mapHeight * 0.55}
              C ${mapWidth * 0.82} ${mapHeight * 0.6}, ${mapWidth * 0.68} ${mapHeight * 0.52}, ${mapWidth * 0.55} ${mapHeight * 0.42}
              Z`}
          fill="#B7C9C4"
          opacity={0.75}
        />

        {/* Route path */}
        <Path
          d={`M ${mapWidth * 0.14} ${mapHeight * 0.7}
              C ${mapWidth * 0.28} ${mapHeight * 0.5}, ${mapWidth * 0.36} ${mapHeight * 0.34}, ${mapWidth * 0.48} ${mapHeight * 0.38}
              S ${mapWidth * 0.68} ${mapHeight * 0.56}, ${mapWidth * 0.78} ${mapHeight * 0.32}`}
          stroke={colors.primary}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.92}
        />
        <Path
          d={`M ${mapWidth * 0.14} ${mapHeight * 0.7}
              C ${mapWidth * 0.28} ${mapHeight * 0.5}, ${mapWidth * 0.36} ${mapHeight * 0.34}, ${mapWidth * 0.48} ${mapHeight * 0.38}
              S ${mapWidth * 0.68} ${mapHeight * 0.56}, ${mapWidth * 0.78} ${mapHeight * 0.32}`}
          stroke="#FFFDF8"
          strokeWidth={1.5}
          strokeLinecap="round"
          fill="none"
          opacity={0.5}
        />

        {/* Waypoints */}
        {[
          { x: mapWidth * 0.14, y: mapHeight * 0.7 },
          { x: mapWidth * 0.48, y: mapHeight * 0.38 },
          { x: mapWidth * 0.78, y: mapHeight * 0.32 },
        ].map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={8}
            fill={colors.surface}
            stroke={colors.primary}
            strokeWidth={3}
          />
        ))}
      </Svg>
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
});
