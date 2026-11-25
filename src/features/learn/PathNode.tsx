import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { LessonSummary } from '@/api/contracts';
import { Artwork } from '@/components/ui/Artwork';
import { ProgressRing } from '@/components/ui';
import { useReducedMotion } from '@/theme/useReducedMotion';
import { palette } from '@/theme/tokens';

import { nodeOffsetX } from './pathGeometry';
import { useTheme } from '@/theme/useTheme';

const STATUS_LABEL = {
  locked: 'locked',
  available: 'available',
  in_progress: 'in progress',
  completed: 'completed',
} as const;

export interface PathNodeProps {
  lesson: LessonSummary;
  index: number;
  isCurrent?: boolean;
  onPress?: () => void;
}

export function PathNode({
  lesson,
  index,
  isCurrent = false,
  onPress,
}: PathNodeProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const inProgress = lesson.status === 'in_progress';
  const badge = locked ? 'locked' : completed ? 'completed' : 'level';
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!isCurrent || reducedMotion) {
      return;
    }

    bob.value = withRepeat(withTiming(-4, { duration: 850 }), -1, true);

    return () => cancelAnimation(bob);
  }, [bob, isCurrent, reducedMotion]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <View
      style={[
        styles.row,
        { transform: [{ translateX: nodeOffsetX(index) }] },
      ]}
    >
      {isCurrent ? (
        <Animated.View style={[styles.startBubble, bubbleStyle]}>
          <Text
            style={[
              theme.typography.caption,
              styles.startText,
              { color: theme.colors.primary },
            ]}
          >
            START HERE
          </Text>
        </Animated.View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Lesson ${index + 1}, ${STATUS_LABEL[lesson.status]}`}
        accessibilityState={{ disabled: locked }}
        disabled={locked}
        onPress={onPress}
        testID={`path-node-${lesson.id}`}
        style={({ pressed }) => [
          styles.node,
          { transform: [{ translateY: pressed ? 4 : 0 }] },
        ]}
      >
        <Artwork name={badge} size={84} />
        {inProgress ? (
          <View pointerEvents="none" style={styles.progressOverlay}>
            <ProgressRing
              value={lesson.bestScore ?? 0.5}
              size={86}
              strokeWidth={4}
              tone="mint"
              label={`Lesson ${index + 1} progress`}
              showLabel={false}
            />
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

/** Decorative reward tile; v1 does not award anything. */
export function ChestTile({ testID }: { testID?: string }) {
  return (
    <View
      accessible
      accessibilityState={{ disabled: true }}
      accessibilityLabel="Chest, coming soon"
      testID={testID}
      style={styles.chestRow}
    >
      <Artwork name="chest" size={64} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    height: 116,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  node: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    top: 1,
    left: 1,
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBubble: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: palette.white,
    borderColor: palette.lilac,
    borderWidth: 2,
    zIndex: 2,
  },
  startText: {
    fontWeight: '900',
    letterSpacing: 0.9,
  },
  chestRow: {
    alignItems: 'center',
    height: 76,
    justifyContent: 'center',
  },
});
