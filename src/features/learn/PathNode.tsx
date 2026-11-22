import type { LessonSummary } from '@/api/contracts';
import { Icon, ProgressRing } from '@/components/ui';
import { ledgeColors } from '@/theme/tokens';

import { nodeOffsetX } from './pathGeometry';
import { useTheme } from '@/theme/useTheme';
import { Pressable, StyleSheet, View } from 'react-native';

const STATUS_LABEL = {
  locked: 'locked',
  available: 'available',
  in_progress: 'in progress',
  completed: 'completed',
} as const;

export interface PathNodeProps {
  lesson: LessonSummary;
  index: number;
  onPress?: () => void;
}

export function PathNode({ lesson, index, onPress }: PathNodeProps) {
  const theme = useTheme();
  const locked = lesson.status === 'locked';
  const completed = lesson.status === 'completed';
  const inProgress = lesson.status === 'in_progress';

  const fill = completed
    ? theme.colors.success
    : locked
      ? theme.colors.surfaceAlt
      : theme.colors.primary;
  const ledge = completed
    ? ledgeColors.mint
    : locked
      ? ledgeColors.neutral
      : ledgeColors.purple;
  const iconColor = completed
    ? theme.colors.onSuccess
    : locked
      ? theme.colors.textMuted
      : theme.colors.onPrimary;

  return (
    <View
      style={[
        styles.row,
        { transform: [{ translateX: nodeOffsetX(index) }] },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Lesson ${index + 1}, ${STATUS_LABEL[lesson.status]}`}
        accessibilityState={{ disabled: locked }}
        disabled={locked}
        onPress={onPress}
        testID={`path-node-${lesson.id}`}
        style={[
          styles.node,
          {
            backgroundColor: fill,
            borderBottomColor: ledge,
            borderBottomWidth: 4,
          },
        ]}
      >
        {inProgress ? (
          <ProgressRing
            value={lesson.bestScore ?? 0.5}
            size={44}
            strokeWidth={4}
            tone="mint"
            label={`Lesson ${index + 1} progress`}
            showLabel={false}
          />
        ) : (
          <Icon
            name={completed ? 'check' : locked ? 'lock' : 'play'}
            color={iconColor}
            size={28}
          />
        )}
      </Pressable>
    </View>
  );
}

/** Decorative reward tile; v1 does not award anything. */
export function ChestTile({ testID }: { testID?: string }) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityState={{ disabled: true }}
      accessibilityLabel="Chest, coming soon"
      testID={testID}
      style={styles.chestRow}
    >
      <View
        style={[
          styles.chest,
          {
            backgroundColor: theme.colors.warning,
            borderBottomColor: ledgeColors.yellow,
            borderBottomWidth: 4,
          },
        ]}
      >
        <Icon name="chest" color={theme.colors.onWarning} size={24} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    height: 96,
    justifyContent: 'center',
  },
  node: {
    alignItems: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  chestRow: {
    alignItems: 'center',
    height: 76,
    justifyContent: 'center',
  },
  chest: {
    alignItems: 'center',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
});
