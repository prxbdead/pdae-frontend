import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, ProgressBar } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export interface QuestionHeaderProps {
  /** Fraction of unique exercises already checked, 0..1. */
  progress: number;
  hearts: number;
  onClose(): void;
}

export function QuestionHeader({
  progress,
  hearts,
  onClose,
}: QuestionHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close lesson"
        onPress={onClose}
        testID="lesson-close"
        style={styles.close}
      >
        <Icon name="close" color={theme.colors.textMuted} size={22} />
      </Pressable>

      <View style={styles.progress}>
        <ProgressBar value={progress} max={1} />
      </View>

      <View
        accessible
        accessibilityLabel={`${hearts} hearts remaining`}
        style={styles.hearts}
      >
        <Icon name="heart" color={theme.colors.danger} size={20} />
        <Text
          style={[theme.typography.caption, { color: theme.colors.text }]}
        >
          {hearts}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  close: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  progress: {
    flex: 1,
  },
  hearts: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    minWidth: 44,
  },
});
