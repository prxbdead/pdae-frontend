import { StyleSheet, Text, View } from 'react-native';

import type { IconName } from '@/assets/icons';
import { useSession } from '@/auth/useSession';
import { Icon } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
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
    <View
      accessible
      accessibilityLabel={label}
      style={[
        styles.stat,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.pill,
          gap: theme.spacing.xxs,
          paddingHorizontal: theme.spacing.xs,
        },
      ]}
    >
      <Icon name={icon} size={20} />
      <Text style={[textVariants.label, { color: theme.colors.text }]}>
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
      <Stat icon="heart" value={user.hearts} label={`${user.hearts} hearts`} />
      <Stat icon="bolt" value={user.xp} label={`${user.xp} XP`} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  stat: {
    alignItems: 'center',
    borderBottomWidth: 4,
    borderWidth: 2,
    flexDirection: 'row',
    height: 36,
  },
});
