import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { Icon } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export type MatchPairsExercise = Extract<Exercise, { type: 'match_pairs' }>;

export interface MatchPairsProps {
  exercise: MatchPairsExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

/**
 * Pair matching built from buttons: pick a left item, then a right item. No
 * drag is required, so keyboard and screen-reader learners can complete it.
 */
export function MatchPairs({
  exercise,
  answer,
  onChange,
  disabled,
}: MatchPairsProps) {
  const theme = useTheme();
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const pairs = answer?.type === 'match_pairs' ? answer.pairs : [];

  const textFor = (
    side: 'left' | 'right',
    id: string,
  ): string =>
    exercise[side].find((item) => item.id === id)?.text ?? id;

  const pairedLeft = new Set(pairs.map((pair) => pair.left));
  const pairedRight = new Set(pairs.map((pair) => pair.right));
  const availableLeft = exercise.left.filter((item) => !pairedLeft.has(item.id));
  const availableRight = exercise.right.filter(
    (item) => !pairedRight.has(item.id),
  );

  const addPair = (rightId: string) => {
    if (!selectedLeft) {
      return;
    }

    onChange({
      type: 'match_pairs',
      pairs: [...pairs, { left: selectedLeft, right: rightId }],
    });
    setSelectedLeft(null);
  };

  const removePair = (leftId: string, rightId: string) => {
    onChange({
      type: 'match_pairs',
      pairs: pairs.filter(
        (pair) => pair.left !== leftId || pair.right !== rightId,
      ),
    });
  };

  return (
    <View style={styles.container}>
      {pairs.length > 0 ? (
        <View style={styles.pairs}>
          {pairs.map((pair) => (
            <View
              key={`${pair.left}-${pair.right}`}
              style={[
                styles.pair,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderRadius: theme.radii.sm,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.pairText,
                  { color: theme.colors.text },
                ]}
              >
                {textFor('left', pair.left)} → {textFor('right', pair.right)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove pair ${textFor('left', pair.left)} and ${textFor('right', pair.right)}`}
                disabled={disabled}
                onPress={() => removePair(pair.left, pair.right)}
                testID={`match-remove-${pair.left}-${pair.right}`}
                style={styles.remove}
              >
                <Icon name="close" color={theme.colors.textMuted} size={18} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            Pick one
          </Text>
          {availableLeft.map((item) => {
            const selected = item.id === selectedLeft;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Select ${item.text}`}
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => setSelectedLeft(item.id)}
                testID={`match-left-${item.id}`}
                style={[
                  styles.item,
                  {
                    backgroundColor: selected
                      ? theme.colors.secondary
                      : theme.colors.surface,
                    borderColor: selected
                      ? theme.colors.primary
                      : theme.colors.border,
                    borderRadius: theme.radii.sm,
                  },
                ]}
              >
                <Text
                  style={[theme.typography.caption, { color: theme.colors.text }]}
                >
                  {item.text}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.column}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            Match with
          </Text>
          {availableRight.map((item) => {
            const blocked = disabled || selectedLeft === null;

            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityLabel={`Match with ${item.text}`}
                accessibilityState={{ disabled: blocked }}
                disabled={blocked}
                onPress={() => addPair(item.id)}
                testID={`match-right-${item.id}`}
                style={[
                  styles.item,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radii.sm,
                    opacity: blocked ? 0.6 : 1,
                  },
                ]}
              >
                <Text
                  style={[theme.typography.caption, { color: theme.colors.text }]}
                >
                  {item.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: '100%',
  },
  pairs: {
    gap: 8,
  },
  pair: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pairText: {
    flexShrink: 1,
  },
  remove: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  item: {
    borderWidth: 2,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
