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
        style={({ pressed }) => [
          styles.close,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.75 : 1,
          },
        ]}
      >
        <Icon name="close" color={theme.colors.textMuted} size={22} />
      </Pressable>

      <View style={styles.progress}>
        <ProgressBar value={progress} max={1} tone="mint" height={16} />
      </View>

      <View
        accessible
        accessibilityLabel={`${hearts} hearts remaining`}
        style={[
          styles.hearts,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Icon name="heart" color={theme.colors.danger} size={18} />
        <Text
          style={[theme.typography.caption, styles.count, { color: theme.colors.danger }]}
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
    gap: 10,
    width: '100%',
  },
  close: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  progress: {
    flex: 1,
  },
  hearts: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 4,
    height: 40,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: 10,
  },
  count: {
    fontWeight: '800',
  },
});
