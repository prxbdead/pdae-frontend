import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Achievement } from '@/api/contracts';
import type { IconName } from '@/assets/icons';
import { Button, Icon, ProgressBar, Sheet } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export interface BadgeGridProps {
  achievements: Achievement[];
}

function badgeIcon(icon: string): IconName {
  if (icon === 'fire' || icon === 'check' || icon === 'bolt') {
    return icon;
  }

  return 'star';
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
            <Pressable
              key={achievement.id}
              accessibilityRole="button"
              accessibilityLabel={`${achievement.title}, ${
                earned
                  ? 'earned'
                  : `locked, ${progress} of ${achievement.target}`
              }`}
              onPress={() => setSelected(achievement)}
              testID={`badge-${achievement.id}`}
              style={[
                styles.badge,
                {
                  backgroundColor: earned
                    ? theme.colors.warning
                    : theme.colors.surfaceAlt,
                  borderColor: earned
                    ? theme.colors.warning
                    : theme.colors.border,
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <Icon
                name={badgeIcon(achievement.icon)}
                color={
                  earned ? theme.colors.onWarning : theme.colors.textMuted
                }
                size={26}
              />
              <Text
                numberOfLines={2}
                style={[
                  theme.typography.caption,
                  styles.title,
                  { color: earned ? theme.colors.onWarning : theme.colors.text },
                ]}
              >
                {achievement.title}
              </Text>
              <Text
                style={[
                  theme.typography.caption,
                  styles.progressText,
                  { color: earned ? theme.colors.onWarning : theme.colors.textMuted },
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
                    height={6}
                  />
                </View>
              ) : null}
            </Pressable>
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
    gap: 10,
  },
  badge: {
    alignItems: 'center',
    borderWidth: 1,
    flexBasis: '30%',
    flexGrow: 1,
    gap: 4,
    minHeight: 116,
    minWidth: 104,
    padding: 12,
  },
  title: {
    fontWeight: '800',
    textAlign: 'center',
  },
  progressText: {
    fontWeight: '700',
  },
  progressBar: {
    width: '100%',
  },
  detail: {
    gap: 12,
  },
});
