import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface CardProps {
  children: ReactNode;
  onPress?(): void;
  padded?: boolean;
  tone?: 'default' | 'accent' | 'danger';
  testID?: string;
}

export function Card({
  children,
  onPress,
  padded = true,
  tone = 'default',
  testID,
}: CardProps) {
  const theme = useTheme();

  const backgroundColor =
    tone === 'accent'
      ? theme.colors.secondary
      : tone === 'danger'
        ? theme.colors.danger
        : theme.colors.surface;

  const content = (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        {
          backgroundColor,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
        },
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) {
    return <View testID={testID}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
});
