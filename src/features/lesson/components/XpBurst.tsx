import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/ui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { motion } from '@/theme/tokens';
import { useReducedMotion } from '@/theme/useReducedMotion';
import { useTheme } from '@/theme/useTheme';

export interface XpBurstProps {
  value: number;
  testID?: string;
}

/**
 * Reward pop: anticipate, pop, settle. Reduced motion shows the final value
 * with no scale change.
 */
export function XpBurst({ value, testID }: XpBurstProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      scale.set(1);

      return;
    }

    scale.set(0.8);
    scale.set(
      withSequence(
        withTiming(1.08, { duration: motion.press }),
        withTiming(1, { duration: motion.ui }),
      ),
    );
  }, [reducedMotion, scale, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <Icon name="bolt" size={44} />
      <Text
        testID={testID}
        style={[theme.typography.display, { color: theme.colors.primary }]}
      >
        +{value} XP
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});
