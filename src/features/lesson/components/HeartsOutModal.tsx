import { StyleSheet, Text, View } from 'react-native';

import { Artwork, Button, Sheet } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

export const HEART_REFILL_GEM_COST = 50;

export interface HeartsOutModalProps {
  visible: boolean;
  /** Current gem balance; when provided with `onSpendGems`, the option shows. */
  gems?: number;
  onRefill(): void;
  onSpendGems?(): void;
  onWait?(): void;
  onLeave(): void;
}

export function HeartsOutModal({
  visible,
  gems,
  onRefill,
  onSpendGems,
  onWait,
  onLeave,
}: HeartsOutModalProps) {
  const theme = useTheme();
  const canAfford = (gems ?? 0) >= HEART_REFILL_GEM_COST;

  return (
    <Sheet
      visible={visible}
      title="Out of hearts"
      onClose={onLeave}
    >
      <View style={styles.body}>
        <Artwork name="heart" size={72} />
        <Text
          style={[
            theme.typography.body,
            styles.copy,
            { color: theme.colors.text },
          ]}
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
      {gems !== undefined && onSpendGems ? (
        <Button
          label={`Use ${HEART_REFILL_GEM_COST} gems`}
          onPress={onSpendGems}
          variant="contrast"
          disabled={!canAfford}
          fullWidth
          testID="spend-gems-hearts"
        />
      ) : null}
      {gems !== undefined && onSpendGems && !canAfford ? (
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted },
          ]}
        >
          You have {gems} gems. You need {HEART_REFILL_GEM_COST - gems} more.
        </Text>
      ) : null}
      {onWait ? (
        <>
          <Button
            label="Wait for hearts"
            onPress={onWait}
            variant="ghost"
            fullWidth
            testID="wait-hearts"
          />
          <Text
            style={[
              theme.typography.caption,
              styles.copy,
              { color: theme.colors.textMuted },
            ]}
          >
            Hearts refill over time. Your progress is saved, so you can come
            back later.
          </Text>
        </>
      ) : null}
      <Button
        label="Leave lesson"
        onPress={onLeave}
        variant="ghost"
        fullWidth
        testID="leave-hearts-out"
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  copy: {
    textAlign: 'center',
  },
  body: {
    alignItems: 'center',
    gap: 8,
  },
});
