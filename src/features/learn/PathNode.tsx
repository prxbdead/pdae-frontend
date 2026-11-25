import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import type { LessonSummary } from '@/api/contracts';
import { Icon, ProgressRing } from '@/components/ui';
import { useReducedMotion } from '@/theme/useReducedMotion';
import { ledgeColors, palette } from '@/theme/tokens';

import { nodeOffsetX } from './pathGeometry';
import { useTheme } from '@/theme/useTheme';

const STATUS_LABEL = { locked: 'locked', available: 'available', in_progress: 'in progress', completed: 'completed' } as const;

export interface PathNodeProps {
  lesson: LessonSummary;
  index: number;
  isCurrent?: boolean;
  onPress?: () => void;
}

export function PathNode({ lesson, index, isCurrent = false, onPress }: PathNodeProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const inProgress = lesson.status === 'in_progress';
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!isCurrent || reducedMotion) return;
    bob.value = withRepeat(withTiming(-4, { duration: 850 }), -1, true);
    return () => cancelAnimation(bob);
  }, [bob, isCurrent, reducedMotion]);

  const bubbleStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const fill = completed ? theme.colors.success : locked ? theme.colors.surfaceAlt : theme.colors.primary;
  const ledge = completed ? ledgeColors.mint : locked ? ledgeColors.neutral : ledgeColors.purple;
  const iconColor = completed ? theme.colors.onSuccess : locked ? theme.colors.textMuted : theme.colors.onPrimary;

  return (
    <View style={[styles.row, { transform: [{ translateX: nodeOffsetX(index) }] }]}>
      {isCurrent ? <Animated.View style={[styles.startBubble, bubbleStyle]}><Text style={[theme.typography.caption, styles.startText, { color: theme.colors.primary }]}>START HERE</Text></Animated.View> : null}
      <View style={[styles.nodeLedge, { backgroundColor: ledge, borderRadius: 44 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Lesson ${index + 1}, ${STATUS_LABEL[lesson.status]}`} accessibilityState={{ disabled: locked }} disabled={locked} onPress={onPress} testID={`path-node-${lesson.id}`} style={({ pressed }) => [styles.node, { backgroundColor: fill, borderColor: locked ? theme.colors.border : ledge, borderRadius: 44, transform: [{ translateY: pressed ? 4 : 0 }] }]}>
          {!locked ? <View pointerEvents="none" style={styles.highlight} /> : null}
          {inProgress ? <ProgressRing value={lesson.bestScore ?? 0.5} size={46} strokeWidth={4} tone="mint" label={`Lesson ${index + 1} progress`} showLabel={false} /> : <Icon name={completed ? 'check' : locked ? 'lock' : 'play'} color={iconColor} size={30} />}
        </Pressable>
      </View>
    </View>
  );
}

/** Decorative reward tile; v1 does not award anything. */
export function ChestTile({ testID }: { testID?: string }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityState={{ disabled: true }} accessibilityLabel="Chest, coming soon" testID={testID} style={styles.chestRow}>
      <View style={[styles.chestLedge, { backgroundColor: ledgeColors.yellow, borderRadius: 20 }]}>
        <View style={[styles.chest, { backgroundColor: theme.colors.warning, borderRadius: 18 }]}>
          <Icon name="chest" color={theme.colors.onWarning} size={25} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', height: 116, justifyContent: 'flex-end', paddingBottom: 4 },
  nodeLedge: { alignItems: 'center', height: 84, justifyContent: 'flex-start', width: 84 },
  node: { alignItems: 'center', borderWidth: 4, height: 80, justifyContent: 'center', overflow: 'hidden', width: 80 },
  highlight: { position: 'absolute', top: 7, left: 7, right: 7, bottom: 7, borderRadius: 999, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  startBubble: { position: 'absolute', top: 0, paddingHorizontal: 13, paddingVertical: 5, borderRadius: 999, backgroundColor: palette.white, borderColor: palette.lilac, borderWidth: 2, zIndex: 2 },
  startText: { fontWeight: '900', letterSpacing: 0.9 },
  chestRow: { alignItems: 'center', height: 76, justifyContent: 'center' },
  chestLedge: { paddingBottom: 4 },
  chest: { alignItems: 'center', height: 58, justifyContent: 'center', width: 58 },
});
