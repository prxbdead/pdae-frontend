import { StyleSheet, Text, View } from 'react-native';

import { textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { formatSignedMoney } from './formatMoney';

export interface PnlPillProps {
  value: number;
  testID?: string;
}

/**
 * Profit or loss as a filled pill. Mint and coral carry the sign visually,
 * the +/- prefix carries it for everyone else, and Plum text keeps AA contrast
 * on both fills.
 */
export function PnlPill({ value, testID }: PnlPillProps) {
  const theme = useTheme();
  const positive = value >= 0;

  return (
    <View
      testID={testID}
      style={[
        styles.pill,
        {
          backgroundColor: positive ? theme.colors.success : theme.colors.danger,
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xxs,
        },
      ]}
    >
      <Text
        style={[
          textVariants.label,
          { color: positive ? theme.colors.onSuccess : theme.colors.onDanger },
        ]}
      >
        {formatSignedMoney(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
  },
});
