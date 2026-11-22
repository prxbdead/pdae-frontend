import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTheme } from '@/theme/useTheme';

export default function ProfileScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Profile" tier="standard" />
      <EmptyState
        icon="profile"
        title="Your progress will live here"
        message="Streak, XP, achievements, and settings."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
