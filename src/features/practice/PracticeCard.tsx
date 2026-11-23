import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

import type { PracticeItem, PracticeTone } from './usePracticeData';

const TONES: Record<PracticeTone, 'primary' | 'success' | 'danger' | 'warning' | 'secondary'> =
  {
    purple: 'primary',
    mint: 'success',
    coral: 'danger',
    yellow: 'warning',
    lilac: 'secondary',
  };

export interface PracticeCardProps {
  item: PracticeItem;
  onPress(): void;
}

export function PracticeCard({ item, onPress }: PracticeCardProps) {
  const theme = useTheme();
  const tone = TONES[item.tone];
  const fill = theme.colors[tone];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      accessibilityState={{ disabled: item.disabled }}
      disabled={item.disabled}
      onPress={onPress}
      testID={`practice-card-${item.kind}`}
      style={[styles.pressable, item.disabled && styles.disabled]}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.ledge,
            {
              backgroundColor: item.disabled
                ? theme.colors.surfaceAlt
                : theme.colors.border,
              borderRadius: theme.radii.lg,
            },
          ]}
        >
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.lg,
                transform: [{ translateY: pressed ? 4 : 0 }],
              },
            ]}
          >
            <View
              style={[
                styles.iconTile,
                {
                  backgroundColor: `${fill}22`,
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <Icon name={item.icon} color={fill} size={26} />
            </View>

            <View style={styles.text}>
              <Text
                style={[theme.typography.heading, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={[
                  theme.typography.caption,
                  { color: theme.colors.textMuted },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
              {item.badge ? (
                <Text
                  style={[
                    theme.typography.caption,
                    styles.badge,
                    {
                      color: item.disabled
                        ? theme.colors.textMuted
                        : theme.colors.primary,
                    },
                  ]}
                >
                  {item.badge}
                </Text>
              ) : null}
            </View>

            {!item.disabled ? (
              <Icon
                name="arrow-right"
                color={theme.colors.textMuted}
                size={18}
              />
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  disabled: {
    opacity: 0.72,
  },
  ledge: {
    paddingBottom: 4,
  },
  card: {
    alignItems: 'center',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    minHeight: 96,
    padding: 14,
  },
  iconTile: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  badge: {
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
