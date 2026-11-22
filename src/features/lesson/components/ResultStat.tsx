import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export interface ResultStatProps {
  label: string;
  value: string;
  testID?: string;
}

export function ResultStat({ label, value, testID }: ResultStatProps) {
  const theme = useTheme();

  return (
    <View testID={testID} style={styles.stat}>
      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        {label}
      </Text>
      <Text
        style={[theme.typography.heading, { color: theme.colors.text }]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stat: {
    gap: 2,
    minWidth: 88,
  },
});
