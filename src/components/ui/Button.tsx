import { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { IconName } from '@/assets/icons';
import { ledgeColors, motion } from '@/theme/tokens';
import { useReducedMotion } from '@/theme/useReducedMotion';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';

export interface ButtonProps {
  label: string;
  onPress(): void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'contrast';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  fullWidth?: boolean;
  testID?: string;
}

const HEIGHTS = { sm: 44, md: 48, lg: 56 } as const;
const LEDGE_OFFSET = 4;

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  testID,
}: ButtonProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const [pressed] = useState(() => new Animated.Value(0));
  const isDisabled = disabled || loading;
  // A disabled button is neutral rather than a dimmed variant, so it can
  // never be mistaken for an available secondary action.
  const showDisabled = disabled && !loading;

  const fill = showDisabled
    ? theme.colors.surfaceAlt
    : variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.secondary
        : variant === 'danger'
          ? theme.colors.danger
          : variant === 'contrast'
            ? theme.colors.surface
            : 'transparent';

  const labelColor = showDisabled
    ? theme.colors.textMuted
    : variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'secondary'
        ? theme.colors.onSecondary
        : variant === 'danger'
          ? theme.colors.onDanger
          : theme.colors.focus;

  const ledge = showDisabled
    ? theme.colors.border
    : variant === 'primary'
      ? ledgeColors.purple
      : variant === 'secondary'
        ? ledgeColors.lilac
        : variant === 'danger'
          ? ledgeColors.coral
          : variant === 'contrast'
            ? theme.colors.border
            : 'transparent';

  const height = HEIGHTS[size];

  function animatePress(toValue: number) {
    Animated.timing(pressed, {
      toValue,
      duration: motion.press,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => {
        if (!reducedMotion) {
          animatePress(LEDGE_OFFSET);
        }
      }}
      onPressOut={() => {
        if (!reducedMotion) {
          animatePress(0);
        }
      }}
      testID={testID}
      style={[styles.pressable, fullWidth && styles.fullWidth]}
    >
      <View
        style={[
          styles.ledge,
          {
            height: height + LEDGE_OFFSET,
            borderRadius: theme.radii.md,
            backgroundColor: ledge,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.surface,
            {
              height,
              borderRadius: theme.radii.md,
              backgroundColor: fill,
              ...(variant === 'contrast' && !showDisabled
                ? { borderColor: theme.colors.border, borderWidth: 2 }
                : null),
            },
            { transform: [{ translateY: pressed }] },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={labelColor} />
          ) : (
            <>
              {icon ? (
                <View testID="button-icon">
                  <Icon name={icon} color={labelColor} size={20} />
                </View>
              ) : null}
              <Text
                numberOfLines={1}
                style={[theme.typography.button, { color: labelColor }]}
              >
                {label}
              </Text>
            </>
          )}
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  ledge: {
    justifyContent: 'flex-start',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
});
