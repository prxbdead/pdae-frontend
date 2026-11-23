import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { useSession } from '@/auth/useSession';
import { Icon } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

function Stat({
  icon,
  value,
  label,
  color,
}: {
  icon: IconName;
  value: number;
  label: string;
  color: string;
}) {
  const theme = useTheme();

  return (
    <View accessible accessibilityLabel={label} style={styles.stat}>
      <Icon name={icon} color={color} size={17} />
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
  const theme = useTheme();

  if (!user) {
    return null;
  }

  return (
    <View style={styles.row}>
      <Stat
        icon="fire"
        value={user.streak.current}
        label={`${user.streak.current} day streak`}
        color={theme.colors.fox}
      />
      <Stat
        icon="gem"
        value={user.gems}
        label={`${user.gems} gems`}
        color={theme.colors.primary}
      />
      <Stat
        icon="heart"
        value={user.hearts}
        label={`${user.hearts} hearts`}
        color={theme.colors.danger}
      />
      <Stat
        icon="bolt"
        value={user.xp}
        label={`${user.xp} XP`}
        color={theme.colors.warning}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  value: {
    fontWeight: '800',
  },
});
