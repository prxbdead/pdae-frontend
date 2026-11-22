import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTheme } from '@/theme/useTheme';

export default function LeaguesScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Leagues" tier="standard" />
      <EmptyState
        icon="leagues"
        title="This week's ladder opens soon"
        message="Earn XP to join a league and climb."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
