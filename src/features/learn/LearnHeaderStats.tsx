import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { useSession } from '@/auth/useSession';
import { Icon } from '@/components/ui';
import { ledgeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function Stat({ icon, value, label, color, ledge }: { icon: IconName; value: number; label: string; color: string; ledge: string }) {
  const theme = useTheme();
  return (
    <View accessible accessibilityLabel={label} style={[styles.pillLedge, { backgroundColor: ledge, borderRadius: 999 }]}>
      <View style={[styles.stat, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Icon name={icon} color={color} size={16} />
        <Text style={[theme.typography.caption, styles.value, { color: theme.colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

export function LearnHeaderStats() {
  const { user } = useSession();
  const theme = useTheme();
  if (!user) return null;

  return (
    <View style={styles.row}>
      <Stat icon="fire" value={user.streak.current} label={`${user.streak.current} day streak`} color={theme.colors.fox} ledge={ledgeColors.coral} />
      <Stat icon="gem" value={user.gems} label={`${user.gems} gems`} color={theme.colors.primary} ledge={ledgeColors.lilac} />
      <Stat icon="heart" value={user.hearts} label={`${user.hearts} hearts`} color={theme.colors.danger} ledge={ledgeColors.coral} />
      <Stat icon="bolt" value={user.xp} label={`${user.xp} XP`} color={theme.colors.warning} ledge={ledgeColors.yellow} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  pillLedge: { paddingBottom: 2 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3, minHeight: 31, paddingHorizontal: 8, borderRadius: 999, borderWidth: 1 },
  value: { fontWeight: '900' },
});
