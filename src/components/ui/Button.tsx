import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { IconName } from '@/assets/icons';
import { ledgeColors, motion } from '@/theme/tokens';
import { useReducedMotion } from '@/theme/useReducedMotion';
import { useTheme } from '@/theme/useTheme';

import { Icon } from './Icon';

export interface ButtonProps {
  label: string;
  onPress(): void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
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
  const pressed = useSharedValue(0);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value }],
  }));

  const fill =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.secondary
        : variant === 'danger'
          ? theme.colors.danger
          : 'transparent';

  const labelColor =
    variant === 'primary'
      ? theme.colors.onPrimary
      : variant === 'secondary'
        ? theme.colors.onSecondary
        : variant === 'danger'
          ? theme.colors.onDanger
          : theme.colors.primary;

  const ledge =
    variant === 'primary'
      ? ledgeColors.purple
      : variant === 'secondary'
        ? ledgeColors.lilac
        : variant === 'danger'
          ? ledgeColors.coral
          : 'transparent';

  const height = HEIGHTS[size];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => {
        if (!reducedMotion) {
          pressed.set(
            withTiming(LEDGE_OFFSET, {
              duration: motion.press,
            }),
          );
        }
      }}
      onPressOut={() => {
        if (!reducedMotion) {
          pressed.set(withTiming(0, { duration: motion.press }));
        }
      }}
      testID={testID}
      style={[
        styles.pressable,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      ]}
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
            },
            animatedStyle,
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
  disabled: {
    opacity: 0.5,
  },
  ledge: {
    justifyContent: 'flex-start',
  },
  surface: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
});
