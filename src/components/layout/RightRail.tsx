import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { useTheme } from '@/theme/useTheme';

const PLACEHOLDERS = [
  { key: 'daily-goal', title: 'Daily goal', body: '0 / 30 XP today' },
  { key: 'streak', title: 'Streak', body: 'Start a lesson to light it' },
  { key: 'league', title: 'League', body: 'Unranked this week' },
  {
    key: 'tip',
    title: 'Tip',
    body: 'Never share a seed phrase. No support agent needs it.',
  },
];

export function RightRail() {
  const theme = useTheme();

  return (
    <View
      testID="right-rail"
      style={[
        styles.rail,
        {
          borderLeftColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {PLACEHOLDERS.map((item) => (
        <Card key={item.key} testID={`right-rail-${item.key}`}>
          <Text
            style={[theme.typography.heading, { color: theme.colors.text }]}
          >
            {item.title}
          </Text>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            {item.body}
          </Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 288,
    padding: 16,
    gap: 12,
    borderLeftWidth: 1,
  },
});
