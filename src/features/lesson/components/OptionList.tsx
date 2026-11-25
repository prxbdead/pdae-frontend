import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
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
      style={[styles.list, { gap: theme.spacing.sm }]}
    >
      {options.map((option, index) => {
        const selected = option.id === selectedId;

        return (
          <Card
            key={option.id}
            accessibilityRole="radio"
            accessibilityLabel={option.text}
            selected={selected}
            disabled={disabled}
            onPress={() => onSelect(option.id)}
            testID={testIDPrefix ? `${testIDPrefix}-${option.id}` : undefined}
            style={{ ...styles.option, gap: theme.spacing.sm }}
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
                  textVariants.label,
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
                textVariants.bodyStrong,
                styles.text,
                { color: theme.colors.text },
              ]}
            >
              {option.text}
            </Text>
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  option: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 60,
  },
  badge: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  text: {
    flex: 1,
  },
});
