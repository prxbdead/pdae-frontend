import { StyleSheet, Text, View } from 'react-native';

import type { LevelUp } from '@/api/contracts';
import { Button, Sheet } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export interface LevelUpModalProps {
  levelUp: LevelUp | null;
  visible: boolean;
  onClose(): void;
}

export function LevelUpModal({
  levelUp,
  visible,
  onClose,
}: LevelUpModalProps) {
  const theme = useTheme();

  if (!levelUp) {
    return null;
  }

  return (
    <Sheet visible={visible} title="Level up!" onClose={onClose}>
      <View style={styles.body}>
        <Text
          style={[theme.typography.heading, { color: theme.colors.text }]}
        >
          Level {levelUp.level}: {levelUp.title}
        </Text>
        <Text
          style={[theme.typography.body, { color: theme.colors.textMuted }]}
        >
          Keep going — your next lesson is waiting on the path.
        </Text>
      </View>
      <Button
        label="Keep going"
        onPress={onClose}
        fullWidth
        testID="level-up-close"
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
  },
});
