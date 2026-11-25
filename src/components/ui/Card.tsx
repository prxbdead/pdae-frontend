import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ledgeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface CardProps {
  children: ReactNode;
  onPress?(): void;
  padded?: boolean;
  tone?: 'default' | 'accent' | 'danger';
  testID?: string;
}

/** Rounded, tactile card with the same 4px ledge language as primary actions. */
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
  const ledgeColor =
    tone === 'accent' ? ledgeColors.lilac
    : tone === 'danger' ? ledgeColors.coral
    : theme.colors.border;

  const content = (
    <View
      style={[
        styles.surface,
        padded && styles.padded,
        {
          backgroundColor,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
        },
      ]}
    >
      {children}
    </View>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={[styles.ledge, { backgroundColor: ledgeColor, borderRadius: theme.radii.lg }]}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={styles.pressable}
    >
      {({ pressed }) => (
        <View style={[styles.ledge, { backgroundColor: ledgeColor, borderRadius: theme.radii.lg }]}>
          <View style={{ transform: [{ translateY: pressed ? 4 : 0 }] }}>
            {content}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%' },
  ledge: { paddingBottom: 4 },
  surface: { borderWidth: 1, overflow: 'hidden' },
  padded: { padding: 16 },
});
