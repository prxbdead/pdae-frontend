import { Fragment } from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme/useTheme';

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CandleChartProps {
  candles: Candle[];
  height?: number;
}

const VIEW_WIDTH = 320;
const PADDING = 24;

/**
 * Accessible candle chart. Each candle carries a testID, and the container
 * exposes a text summary so the chart is never color-only.
 */
export function CandleChart({ candles, height = 160 }: CandleChartProps) {
  const theme = useTheme();
  const highs = candles.map((candle) => candle.high);
  const lows = candles.map((candle) => candle.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;
  const slot = (VIEW_WIDTH - PADDING * 2) / Math.max(candles.length, 1);
  const bodyWidth = Math.max(6, Math.min(slot * 0.55, 26));

  const y = (price: number): number =>
    PADDING + ((max - price) / range) * (height - PADDING * 2);

  const first = candles[0];
  const last = candles[candles.length - 1];
  const summary = `Chart with ${candles.length} candles; open ${first?.open ?? 0}, close ${last?.close ?? 0}`;

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={summary}
      testID="candle-chart"
    >
      <Svg width="100%" height={height} viewBox={`0 0 ${VIEW_WIDTH} ${height}`}>
        <SvgText
          x={2}
          y={14}
          fontSize={11}
          fill={theme.colors.textMuted}
        >
          {max}
        </SvgText>
        <SvgText
          x={2}
          y={height - 6}
          fontSize={11}
          fill={theme.colors.textMuted}
        >
          {min}
        </SvgText>
        {candles.map((candle, index) => {
          const x = PADDING + slot * (index + 0.5);
          const rising = candle.close >= candle.open;
          const color = rising ? theme.colors.success : theme.colors.danger;
          const top = y(Math.max(candle.open, candle.close));
          const bottom = y(Math.min(candle.open, candle.close));

          return (
            <Fragment key={`candle-${index}`}>
              <Line
                x1={x}
                x2={x}
                y1={y(candle.high)}
                y2={y(candle.low)}
                stroke={color}
                strokeWidth={2}
              />
              <Rect
                testID={`candle-${index}`}
                x={x - bodyWidth / 2}
                y={top}
                width={bodyWidth}
                height={Math.max(2, bottom - top)}
                fill={color}
                rx={2}
              />
            </Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
