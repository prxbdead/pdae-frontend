import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, ProgressBar } from '@/components/ui';
import { textVariants } from '@/theme/tokens';
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
    <View style={[styles.header, { gap: theme.spacing.sm }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close lesson"
        onPress={onClose}
        testID="lesson-close"
        style={({ pressed }) => [
          styles.close,
          { backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent' },
        ]}
      >
        <Icon name="close" color={theme.colors.textMuted} size={24} />
      </Pressable>

      <View style={styles.progress}>
        <ProgressBar value={progress} max={1} tone="mint" height={16} />
      </View>

      <View
        accessible
        accessibilityLabel={`${hearts} hearts remaining`}
        style={styles.hearts}
      >
        <Icon name="heart" size={28} />
        <Text style={[textVariants.numeral, { color: theme.colors.text }]}>
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
    width: '100%',
  },
  close: {
    alignItems: 'center',
    borderRadius: 999,
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
    minWidth: 52,
  },
});
