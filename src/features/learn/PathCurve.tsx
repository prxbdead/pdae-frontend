import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

import {
  nodesHeight,
  nodeCenterY,
  nodeOffsetX,
} from './pathGeometry';

export interface PathCurveProps {
  count: number;
}

/**
 * Dashed curve through the node centers. It measures its wrapper so the x
 * offsets stay aligned with the absolutely offset nodes at any width.
 */
export function PathCurve({ count }: PathCurveProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const height = nodesHeight(count);

  if (count < 2) {
    return null;
  }

  const nodes = Array.from({ length: count }, (_, index) => ({
    x: width / 2 + nodeOffsetX(index),
    y: nodeCenterY(index),
  }));

  // Lead in and out at the centre line so the path flows from the banner,
  // through the nodes, and toward the next unit instead of stopping dead.
  const centers = [
    { x: width / 2, y: nodes[0].y - 36 },
    ...nodes,
    { x: width / 2, y: nodes[nodes.length - 1].y + 36 },
  ];

  let d = `M ${centers[0].x} ${centers[0].y}`;

  for (let index = 1; index < centers.length; index += 1) {
    const previous = centers[index - 1];
    const current = centers[index];
    const midY = (previous.y + current.y) / 2;

    d += ` C ${previous.x} ${midY}, ${current.x} ${midY}, ${current.x} ${current.y}`;
  }

  return (
    <View
      pointerEvents="none"
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={styles.curve}
    >
      {width > 0 ? (
        <Svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <Path
            d={d}
            stroke={theme.colors.border}
            strokeWidth={3}
            strokeDasharray="6 8"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  curve: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
