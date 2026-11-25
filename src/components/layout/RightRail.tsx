import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/useTheme';

const PLACEHOLDERS = [
  { key: 'daily-goal', title: 'Daily goal', body: '0 / 30 XP today' },
  { key: 'streak', title: 'Streak', body: 'Start a lesson to light it' },
  { key: 'league', title: 'League', body: 'Unranked this week' },
  { key: 'tip', title: 'Safety tip', body: 'Never share a seed phrase. No support agent needs it.' },
];

export function RightRail() {
  const theme = useTheme();
  return (
    <View testID="right-rail" style={[styles.rail, { borderLeftColor: theme.colors.border, backgroundColor: theme.colors.background }]}>
      <View style={styles.heading}>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>Your progress</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>A little each day adds up.</Text>
      </View>
      <Card testID="right-rail-daily-goal">
        <View style={styles.cardHead}>
          <View style={[styles.iconTile, { backgroundColor: '#FFF4C2' }]}><Icon name="bolt" color="#A77B00" size={19} /></View>
          <Text style={[theme.typography.heading, { color: theme.colors.text }]}>Daily goal</Text>
        </View>
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>0 / 30 XP</Text>
        <ProgressBar value={0} max={30} height={10} tone="yellow" />
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Complete one lesson to get started</Text>
      </Card>
      {PLACEHOLDERS.slice(1).map((item, index) => (
        <Card key={item.key} testID={`right-rail-${item.key}`}>
          <View style={styles.cardHead}>
            <View style={[styles.iconTile, { backgroundColor: theme.colors.surfaceAlt }]}><Icon name={index === 0 ? 'fire' : index === 1 ? 'leagues' : 'shield'} color={theme.colors.primary} size={19} /></View>
            <Text style={[theme.typography.heading, { color: theme.colors.text }]}>{item.title}</Text>
          </View>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{item.body}</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: { width: 288, padding: 18, gap: 14, borderLeftWidth: 1 },
  heading: { gap: 3, paddingHorizontal: 4, paddingBottom: 2 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  iconTile: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
});
