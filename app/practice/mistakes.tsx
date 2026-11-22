import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState, PageHeader } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

/**
 * Destination for the result screen's "Practice mistakes" action. The mistake
 * review itself arrives with the Practice hub.
 */
export default function MistakesRoute() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="Mistakes review"
        tier="compact"
        onBack={() => router.back()}
      />
      <EmptyState
        icon="practice"
        title="Mistakes review"
        message="Finish a lesson and the questions you missed will collect here."
        actionLabel="Back to Learn"
        onAction={() => router.dismissTo('/(tabs)/learn')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
