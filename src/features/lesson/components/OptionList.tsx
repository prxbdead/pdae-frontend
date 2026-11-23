import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface Option {
  id: string;
  text: string;
}

export interface OptionListProps {
  options: Option[];
  selectedId: string | null;
  onSelect(id: string): void;
  disabled?: boolean;
  testIDPrefix?: string;
}

/**
 * Numbered, keyboard-friendly option cards shared by every single-choice
 * exercise. Number badges match the `1`–`9` web shortcuts.
 */
export function OptionList({
  options,
  selectedId,
  onSelect,
  disabled = false,
  testIDPrefix,
}: OptionListProps) {
  const theme = useTheme();

  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.list, disabled && styles.disabled]}
    >
      {options.map((option, index) => {
        const selected = option.id === selectedId;
        const borderColor = selected
          ? theme.colors.primary
          : theme.colors.border;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityLabel={option.text}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onSelect(option.id)}
            testID={
              testIDPrefix ? `${testIDPrefix}-${option.id}` : undefined
            }
            style={styles.pressable}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.ledge,
                  {
                    backgroundColor: borderColor,
                    borderRadius: theme.radii.md,
                  },
                ]}
              >
                <View
                  style={[
                    styles.option,
                    {
                      backgroundColor: selected
                        ? theme.colors.secondary
                        : theme.colors.surface,
                      borderColor,
                      borderRadius: theme.radii.md,
                      transform: [{ translateY: pressed ? 4 : 0 }],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: selected
                          ? theme.colors.primary
                          : theme.colors.surfaceAlt,
                        borderRadius: theme.radii.sm,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        theme.typography.caption,
                        styles.badgeText,
                        {
                          color: selected
                            ? theme.colors.onPrimary
                            : theme.colors.textMuted,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      theme.typography.body,
                      styles.text,
                      { color: theme.colors.text },
                    ]}
                  >
                    {option.text}
                  </Text>
                </View>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    width: '100%',
  },
  disabled: {
    opacity: 0.7,
  },
  pressable: {
    width: '100%',
  },
  ledge: {
    paddingBottom: 4,
  },
  option: {
    alignItems: 'center',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    minHeight: 60,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  badge: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  badgeText: {
    fontWeight: '800',
  },
  text: {
    flexShrink: 1,
  },
});
