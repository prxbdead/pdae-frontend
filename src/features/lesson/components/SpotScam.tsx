import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { useTheme } from '@/theme/useTheme';

export type SpotScamExercise = Extract<Exercise, { type: 'spot_scam' }>;

export interface SpotScamProps {
  exercise: SpotScamExercise;
  answer: Answer | undefined;
  onChange(answer: Answer): void;
  disabled?: boolean;
}

export function SpotScam({
  exercise,
  answer,
  onChange,
  disabled,
}: SpotScamProps) {
  const theme = useTheme();
  const selected = new Set(
    answer?.type === 'spot_scam' ? answer.hotspotIds : [],
  );

  const toggle = (id: string) => {
    const next = new Set(selected);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    onChange({
      type: 'spot_scam',
      hotspotIds: exercise.hotspots
        .filter((hotspot) => next.has(hotspot.id))
        .map((hotspot) => hotspot.id),
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.artifact,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.md,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted },
          ]}
        >
          {exercise.artifact.kind === 'dm'
            ? 'Direct message'
            : exercise.artifact.kind === 'email'
              ? 'Email'
              : 'Token page'}
        </Text>
        <Text
          style={[theme.typography.heading, { color: theme.colors.text }]}
        >
          {exercise.artifact.title}
        </Text>
        <Text
          style={[theme.typography.body, { color: theme.colors.text }]}
        >
          {exercise.artifact.body}
        </Text>
      </View>

      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        Tap the suspicious parts.
      </Text>

      <View style={styles.hotspots}>
        {exercise.hotspots.map((hotspot) => {
          const checked = selected.has(hotspot.id);

          return (
            <Pressable
              key={hotspot.id}
              accessibilityRole="checkbox"
              accessibilityLabel={`${hotspot.label}: ${hotspot.text}`}
              accessibilityState={{ checked, disabled }}
              disabled={disabled}
              onPress={() => toggle(hotspot.id)}
              testID={`hotspot-${hotspot.id}`}
              style={[
                styles.hotspot,
                {
                  backgroundColor: checked
                    ? theme.colors.surfaceAlt
                    : theme.colors.surface,
                  borderColor: checked
                    ? theme.colors.danger
                    : theme.colors.border,
                  borderRadius: theme.radii.sm,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.hotspotLabel,
                  { color: theme.colors.textMuted },
                ]}
              >
                {checked ? 'Flagged' : 'Flag this'}
              </Text>
              <Text
                style={[theme.typography.body, { color: theme.colors.text }]}
              >
                “{hotspot.text}”
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: '100%',
  },
  artifact: {
    borderWidth: 2,
    gap: 8,
    padding: 16,
  },
  hotspots: {
    gap: 10,
  },
  hotspot: {
    borderWidth: 2,
    gap: 4,
    padding: 12,
  },
  hotspotLabel: {
    textTransform: 'uppercase',
  },
});
