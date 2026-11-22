import { StyleSheet, Text, View } from 'react-native';

import { Button, Sheet } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export interface HeartsOutModalProps {
  visible: boolean;
  onRefill(): void;
  onLeave(): void;
}

export function HeartsOutModal({
  visible,
  onRefill,
  onLeave,
}: HeartsOutModalProps) {
  const theme = useTheme();

  return (
    <Sheet
      visible={visible}
      title="Out of hearts"
      onClose={onLeave}
    >
      <View style={styles.body}>
        <Text
          style={[theme.typography.body, { color: theme.colors.text }]}
        >
          You have used all five hearts in this lesson. Your progress is saved —
          practice to refill and keep going.
        </Text>
      </View>
      <Button
        label="Practice to refill"
        onPress={onRefill}
        fullWidth
        testID="refill-hearts"
      />
      <Button
        label="Leave lesson"
        onPress={onLeave}
        variant="secondary"
        fullWidth
        testID="leave-hearts-out"
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
  },
});
