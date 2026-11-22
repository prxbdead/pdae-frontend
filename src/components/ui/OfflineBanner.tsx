import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

import { Button } from './Button';

export interface OfflineBannerProps {
  state?: 'offline' | 'syncing' | 'error' | 'paused_auth';
  pending?: number;
  onRetry?(): void;
  testID?: string;
}

export function OfflineBanner({
  state = 'offline',
  pending = 0,
  onRetry,
  testID,
}: OfflineBannerProps) {
  const theme = useTheme();

  const message =
    state === 'syncing'
      ? pending > 0
        ? `Syncing ${pending} saved result${pending === 1 ? '' : 's'}…`
        : 'Syncing your progress…'
      : state === 'error'
        ? "Couldn't sync. Your result is saved on this device."
        : state === 'paused_auth'
          ? 'Sign in to sync your saved results.'
          : "You're offline. Downloaded lessons still work.";

  const background =
    state === 'error' || state === 'paused_auth'
      ? theme.colors.surfaceAlt
      : theme.colors.secondary;

  const foreground =
    state === 'error' || state === 'paused_auth'
      ? theme.colors.text
      : theme.colors.onSecondary;

  return (
    <View
      testID={testID ?? 'offline-banner'}
      accessibilityLiveRegion="polite"
      style={[
        styles.banner,
        { backgroundColor: background, borderRadius: theme.radii.md },
      ]}
    >
      <Text style={[theme.typography.caption, styles.message, { color: foreground }]}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          label={state === 'paused_auth' ? 'Sign in to sync' : 'Retry'}
          onPress={onRetry}
          size="sm"
          variant="ghost"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  message: {
    flexShrink: 1,
  },
});
