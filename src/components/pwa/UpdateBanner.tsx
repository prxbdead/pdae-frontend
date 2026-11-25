import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ledgeColors, textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { useServiceWorkerUpdate } from '@/pwa/useServiceWorkerUpdate';

/**
 * Shown when a new web build is waiting. Refresh activates the new worker and
 * reloads, so the learner chooses when the page changes. Renders nothing on
 * native and whenever no update is waiting.
 */
export function UpdateBanner() {
  const theme = useTheme();
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <View
      testID="update-banner"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.primarySoft,
          borderColor: ledgeColors.lilac,
          borderRadius: theme.radii.md,
          marginHorizontal: theme.spacing.md,
          marginTop: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.xs,
        },
      ]}
    >
      <Text
        style={[textVariants.label, styles.message, { color: theme.colors.text }]}
      >
        A new version is ready
      </Text>
      <Button
        label="Refresh"
        size="sm"
        variant="primary"
        onPress={applyUpdate}
        testID="update-banner-refresh"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  message: {
    flexShrink: 1,
  },
});
