import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { useSession } from '@/auth/useSession';
import { Icon } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

function Stat({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: number;
  label: string;
}) {
  const theme = useTheme();

  return (
    <View accessible accessibilityLabel={label} style={styles.stat}>
      <Icon name={icon} color={theme.colors.fox} size={16} />
      <Text
        style={[
          theme.typography.caption,
          styles.value,
          { color: theme.colors.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function LearnHeaderStats() {
  const { user } = useSession();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Stat
        icon="fire"
        value={user.streak.current}
        label={`${user.streak.current} day streak`}
      />
      <Stat icon="gem" value={user.gems} label={`${user.gems} gems`} />
      <Stat icon="bolt" value={user.xp} label={`${user.xp} XP`} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  stat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  value: {
    fontWeight: '800',
  },
});
