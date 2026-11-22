import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { useTheme } from '@/theme/useTheme';

export default function NotFoundScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <EmptyState
        icon="search"
        title="That page doesn't exist"
        message="The link may be out of date."
        actionLabel="Go to Learn"
        onAction={() => router.replace('/learn')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
});
