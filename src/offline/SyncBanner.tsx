import { useRouter } from 'expo-router';

import { OfflineBanner } from '@/components/ui';

import { useSyncOptional } from './SyncProvider';
import { useSyncStatus } from './useSyncStatus';

export interface SyncBannerProps {
  testID?: string;
}

/**
 * The one place that turns the sync engine's state into a banner. Screens use
 * it instead of hardcoding an offline notice, so pending counts, retries, and
 * the auth-paused state stay in sync with the outbox.
 */
export function SyncBanner({ testID }: SyncBannerProps) {
  const status = useSyncStatus();
  const sync = useSyncOptional();
  const router = useRouter();

  if (status.state === 'idle') {
    return null;
  }

  const onRetry =
    status.state === 'paused_auth'
      ? () => router.push('/login')
      : status.state === 'offline' || status.state === 'error'
        ? () => {
            void sync?.flush();
          }
        : undefined;

  return (
    <OfflineBanner
      state={status.state}
      pending={status.pending}
      onRetry={onRetry}
      testID={testID}
    />
  );
}
