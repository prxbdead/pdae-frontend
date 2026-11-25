import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { ledgeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface CardProps {
  children: ReactNode;
  onPress?(): void;
  padded?: boolean;
  tone?: 'default' | 'accent' | 'danger';
  disabled?: boolean;
  /** Highlights the card as the chosen option in a single-choice group. */
  selected?: boolean;
  accessibilityRole?: 'button' | 'radio' | 'checkbox';
  accessibilityLabel?: string;
  style?: ViewStyle;
  testID?: string;
}

const BORDER = 2;
const LEDGE = 4;

/**
 * The one surface used for grouped content. A 2 px outline with a 4 px bottom
 * ledge gives the tactile Hodlo look without blur shadows. Pressable cards
 * drop onto their ledge instead of fading.
 */
export function Card({
  children,
  onPress,
  padded = true,
  tone = 'default',
  disabled = false,
  selected,
  accessibilityRole = 'button',
  accessibilityLabel,
  style,
  testID,
}: CardProps) {
  const theme = useTheme();
  const { colors, radii, spacing } = theme;

  const backgroundColor =
    selected || tone === 'accent'
      ? colors.primarySoft
      : tone === 'danger'
        ? colors.dangerSoft
        : colors.surface;
  const borderColor = selected
    ? colors.focus
    : tone === 'accent'
      ? ledgeColors.lilac
      : tone === 'danger'
        ? ledgeColors.coral
        : colors.border;

  const surface = (pressed: boolean): ViewStyle => ({
    backgroundColor,
    borderColor,
    borderRadius: radii.md,
    borderWidth: BORDER,
    borderBottomWidth: pressed ? BORDER : LEDGE,
    marginTop: pressed ? LEDGE - BORDER : 0,
    padding: padded ? spacing.md : 0,
  });

  if (!onPress) {
    return (
      <View testID={testID} style={[styles.base, surface(false), style]}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        surface(pressed && !disabled),
        disabled && !selected && styles.disabled,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  disabled: { opacity: 0.6 },
});
