import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Achievement } from '@/api/contracts';
import { Artwork, Button, Card, ProgressBar, Sheet } from '@/components/ui';
import { ledgeColors, textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { achievementArtwork } from './achievementArt';

export interface BadgeGridProps {
  achievements: Achievement[];
}

export function BadgeGrid({ achievements }: BadgeGridProps) {
  const theme = useTheme();
  const [selected, setSelected] = useState<Achievement | null>(null);

  return (
    <>
      <View style={styles.grid}>
        {achievements.map((achievement) => {
          const earned = achievement.earnedAt !== null;
          const progress = Math.min(achievement.progress, achievement.target);

          return (
            <Card
              key={achievement.id}
              accessibilityLabel={`${achievement.title}, ${
                earned
                  ? 'earned'
                  : `locked, ${progress} of ${achievement.target}`
              }`}
              onPress={() => setSelected(achievement)}
              testID={`badge-${achievement.id}`}
              style={{
                ...styles.badge,
                backgroundColor: earned
                  ? theme.colors.warningSoft
                  : theme.colors.surface,
                borderColor: earned ? ledgeColors.yellow : theme.colors.border,
              }}
            >
              <View style={earned ? undefined : styles.locked}>
                <Artwork name={achievementArtwork(achievement)} size={56} />
              </View>
              <Text
                numberOfLines={2}
                style={[
                  textVariants.label,
                  styles.title,
                  { color: theme.colors.text },
                ]}
              >
                {achievement.title}
              </Text>
              <Text
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textMuted },
                ]}
              >
                {earned ? 'Earned' : `${progress} / ${achievement.target}`}
              </Text>
              {!earned ? (
                <View style={styles.progressBar}>
                  <ProgressBar
                    value={
                      achievement.target > 0
                        ? progress / achievement.target
                        : 0
                    }
                    height={8}
                  />
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>

      <Sheet
        visible={selected !== null}
        title={selected?.title}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <View testID="badge-detail" style={styles.detail}>
            <View style={styles.detailArt}>
              <Artwork name={achievementArtwork(selected)} size={96} />
            </View>
            <Text
              style={[theme.typography.body, { color: theme.colors.textMuted }]}
            >
              {selected.description}
            </Text>
            <Text
              style={[theme.typography.caption, { color: theme.colors.text }]}
            >
              {selected.earnedAt
                ? `Earned ${new Date(selected.earnedAt).toLocaleDateString()}`
                : `Progress ${Math.min(selected.progress, selected.target)} / ${selected.target}`}
            </Text>
            <Button
              label="Close"
              onPress={() => setSelected(null)}
              fullWidth
              variant="secondary"
            />
          </View>
        ) : null}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    alignItems: 'center',
    flexBasis: '30%',
    flexGrow: 1,
    gap: 4,
    minHeight: 136,
    minWidth: 104,
    padding: 12,
  },
  locked: {
    opacity: 0.35,
  },
  title: {
    textAlign: 'center',
  },
  progressBar: {
    alignSelf: 'stretch',
    marginTop: 4,
  },
  detail: {
    gap: 12,
  },
  detailArt: {
    alignItems: 'center',
  },
});
