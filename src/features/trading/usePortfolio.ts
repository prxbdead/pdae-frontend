import { useQuery } from '@tanstack/react-query';

import { useApi } from '@/api/ApiProvider';
import type { Portfolio, Quote } from '@/api/contracts';

export const TRADE_SYMBOLS = ['BTC', 'ETH', 'SOL'] as const;

export interface PortfolioQuery {
  data: Portfolio | null;
  isLoading: boolean;
  error: unknown;
  refresh(): void;
}

export interface QuotesQuery {
  data: Quote[];
  isLoading: boolean;
  error: unknown;
}

export function usePortfolio(): PortfolioQuery {
  const { client } = useApi();
  const query = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => client.trading.getPortfolio(),
    staleTime: 30_000,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ?? null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useQuotes(
  symbols: readonly string[] = TRADE_SYMBOLS,
): QuotesQuery {
  const { client } = useApi();
  const query = useQuery({
    queryKey: ['quotes', ...symbols],
    queryFn: () => client.trading.getQuotes([...symbols]),
    staleTime: 30_000,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isPending,
    error: query.error ?? null,
  };
}
