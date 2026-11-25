import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
import { toneColors, type Tone } from '@/theme/tones';
import { useTheme } from '@/theme/useTheme';

export interface ResultStatProps {
  label: string;
  value: string;
  tone?: Tone;
  icon?: IconName;
  testID?: string;
}

/** A labelled stat tile: a tinted header band over a bordered value body. */
export function ResultStat({
  label,
  value,
  tone = 'purple',
  icon,
  testID,
}: ResultStatProps) {
  const theme = useTheme();
  const colors = toneColors(theme.colors, tone);

  return (
    <View
      testID={testID}
      style={[
        styles.stat,
        {
          backgroundColor: theme.colors.surface,
          borderColor: colors.fill,
          borderRadius: theme.radii.md,
        },
      ]}
    >
      <View style={[styles.band, { backgroundColor: colors.fill }]}>
        <Text style={[textVariants.overline, { color: colors.on }]}>
          {label}
        </Text>
      </View>
      <View style={[styles.body, { gap: theme.spacing.xxs }]}>
        {icon ? <Icon name={icon} size={24} /> : null}
        <Text
          numberOfLines={1}
          style={[textVariants.numeral, { color: theme.colors.text }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    borderWidth: 2,
    flex: 1,
    minWidth: 88,
    overflow: 'hidden',
  },
  band: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  body: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
  },
});
