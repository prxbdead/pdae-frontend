import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { useTheme } from '@/theme/useTheme';

export default function PracticeScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader title="Practice" tier="standard" />
      <EmptyState
        icon="practice"
        title="Nothing to review yet"
        message="Mistakes and paper trades show up here."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
