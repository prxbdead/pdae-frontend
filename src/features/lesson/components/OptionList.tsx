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
            style={[
              styles.option,
              {
                backgroundColor: selected
                  ? theme.colors.secondary
                  : theme.colors.surface,
                borderColor: selected
                  ? theme.colors.primary
                  : theme.colors.border,
                borderRadius: theme.radii.md,
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
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    width: '100%',
  },
  disabled: {
    opacity: 0.7,
  },
  option: {
    alignItems: 'center',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    minHeight: 56,
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
    fontWeight: '700',
  },
  text: {
    flexShrink: 1,
  },
});
