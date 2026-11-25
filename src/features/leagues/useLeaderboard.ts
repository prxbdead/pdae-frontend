import { useQuery } from '@tanstack/react-query';

import { useApi } from '@/api/ApiProvider';
import type { Leaderboard } from '@/api/contracts';
import { useSyncStatus } from '@/offline/useSyncStatus';

export interface LeaderboardQuery {
  data: Leaderboard | null;
  isLoading: boolean;
  error: unknown;
  isStale: boolean;
  refresh(): void;
}

export function useLeaderboard(): LeaderboardQuery {
  const { client } = useApi();
  const sync = useSyncStatus();
  const query = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: () => client.leaderboard.getWeekly(),
    staleTime: 60_000,
  });
  const data = query.data ?? null;
  const offline = sync.state === 'offline';

  return {
    data,
    isLoading: query.isPending,
    error: query.error ?? null,
    isStale: Boolean(data && (offline || query.error)),
    refresh: () => {
      void query.refetch();
    },
  };
}
