import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import type { LessonSummary } from '@/api/contracts';
import { Artwork } from '@/components/ui/Artwork';
import { ProgressRing } from '@/components/ui';
import { useReducedMotion } from '@/theme/useReducedMotion';
import { ledgeColors, textVariants } from '@/theme/tokens';

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
  const [bob] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!isCurrent || reducedMotion) {
      return;
    }

    // Bob up and back down forever, matching the old repeat-with-reverse.
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -4,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => {
      animation.stop();
      bob.setValue(0);
    };
  }, [bob, isCurrent, reducedMotion]);

  const bubbleStyle = { transform: [{ translateY: bob }] };

  return (
    <View
      style={[
        styles.row,
        { transform: [{ translateX: nodeOffsetX(index) }] },
      ]}
    >
      {isCurrent ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.startWrap, bubbleStyle]}
        >
          <View
            style={[
              styles.startBubble,
              {
                backgroundColor: theme.colors.surface,
                borderColor: ledgeColors.lilac,
                borderRadius: theme.radii.md,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[textVariants.overline, { color: theme.colors.focus }]}
            >
              Start here
            </Text>
          </View>
          <View
            style={[
              styles.startPointer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: ledgeColors.lilac,
              },
            ]}
          />
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
      <View style={styles.chestDim}>
        <Artwork name="chest" size={64} />
      </View>
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
  startWrap: {
    alignItems: 'center',
    bottom: 96,
    left: -36,
    position: 'absolute',
    width: 160,
    zIndex: 2,
  },
  startBubble: {
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  startPointer: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    height: 12,
    marginTop: -7,
    transform: [{ rotate: '45deg' }],
    width: 12,
  },
  chestDim: {
    opacity: 0.55,
  },
  chestRow: {
    alignItems: 'center',
    height: 76,
    justifyContent: 'center',
  },
});
