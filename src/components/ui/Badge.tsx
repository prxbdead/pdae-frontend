import { StyleSheet, Text, View } from 'react-native';

import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export interface BadgeProps {
  label: string;
  tone?: 'purple' | 'mint' | 'yellow' | 'coral' | 'lilac' | 'neutral';
  testID?: string;
}

export function Badge({ label, tone = 'purple', testID }: BadgeProps) {
  const theme = useTheme();

  const { background, foreground } = {
    purple: { background: theme.colors.primary, foreground: theme.colors.onPrimary },
    mint: { background: theme.colors.success, foreground: theme.colors.onSuccess },
    yellow: { background: theme.colors.warning, foreground: theme.colors.onWarning },
    coral: { background: theme.colors.danger, foreground: theme.colors.onDanger },
    lilac: { background: theme.colors.secondary, foreground: theme.colors.onSecondary },
    neutral: { background: theme.colors.surfaceAlt, foreground: theme.colors.text },
  }[tone];

  return (
    <View
      testID={testID}
      style={[
        styles.badge,
        {
          backgroundColor: background,
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
        },
      ]}
    >
      <Text style={[textVariants.label, { color: foreground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
});
