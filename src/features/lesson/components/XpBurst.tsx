import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { Icon } from '@/components/ui';

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
  const [scale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (reducedMotion) {
      scale.setValue(1);

      return;
    }

    scale.setValue(0.8);
    const animation = Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.08,
        duration: motion.press,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: motion.ui,
        useNativeDriver: true,
      }),
    ]);
    animation.start();

    return () => animation.stop();
  }, [reducedMotion, scale, value]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
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
