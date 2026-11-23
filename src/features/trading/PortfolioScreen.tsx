import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Holding, Trade } from '@/api/contracts';
import {
  Button,
  EmptyState,
  OfflineBanner,
  PageHeader,
} from '@/components/ui';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { ledgeColors } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { formatMoney, formatQuantity, formatSignedMoney } from './formatMoney';
import { TradeSheet } from './TradeSheet';
import { usePortfolio, useQuotes } from './usePortfolio';

function formatTimestamp(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function HoldingRow({ holding }: { holding: Holding }) {
  const theme = useTheme();
  const positive = holding.pnl >= 0;

  return (
    <View
      testID={`holding-${holding.symbol}`}
      style={[styles.holding, { borderBottomColor: theme.colors.border }]}
    >
      <View
        style={[
          styles.symbolTile,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radii.sm,
          },
        ]}
      >
        <Text style={[theme.typography.heading, { color: theme.colors.primary }]}>
          {holding.symbol.slice(0, 1)}
        </Text>
      </View>

      <View style={styles.holdingText}>
        <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
          {holding.symbol}
        </Text>
        <Text
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
        >
          {formatQuantity(holding.quantity)} · {formatMoney(holding.currentPrice)}
        </Text>
      </View>

      <View style={styles.holdingValue}>
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          {formatMoney(holding.value)}
        </Text>
        <Text
          testID={`holding-pnl-${holding.symbol}`}
          style={[
            theme.typography.caption,
            styles.strong,
            {
              color: positive
                ? theme.colors.success
                : theme.colors.danger,
            },
          ]}
        >
          {formatSignedMoney(holding.pnl)}
        </Text>
      </View>
    </View>
  );
}

export function PortfolioScreen() {
  const theme = useTheme();
  const router = useRouter();
  const sync = useSyncStatus();
  const { data, isLoading, error, refresh } = usePortfolio();
  const { data: quotes } = useQuotes();
  const [tradeOpen, setTradeOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const offline = sync.state === 'offline';

  const cached = Boolean(data && (offline || error));

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="Paper trading"
        tier="compact"
        onBack={() => router.back()}
      />

      {offline ? (
        <OfflineBanner state="offline" testID="portfolio-offline-banner" />
      ) : null}

      {isLoading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : !data ? (
        <EmptyState
          icon="chart"
          title="Couldn't load your portfolio"
          message="Try again when you have a connection."
          actionLabel="Retry"
          onAction={refresh}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View
            style={[
              styles.walletLedge,
              {
                backgroundColor: ledgeColors.purple,
                borderRadius: theme.radii.lg,
              },
            ]}
          >
            <View
              style={[
                styles.wallet,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.lg,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.kicker,
                  { color: theme.colors.onPrimary },
                ]}
              >
                VIRTUAL CASH
              </Text>
              <Text
                style={[theme.typography.display, { color: theme.colors.onPrimary }]}
              >
                {formatMoney(data.cash)}
              </Text>

              <View style={styles.walletBottom}>
                <View>
                  <Text
                    style={[
                      theme.typography.caption,
                      styles.mutedOnPrimary,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    Total value
                  </Text>
                  <Text
                    style={[
                      theme.typography.heading,
                      { color: theme.colors.onPrimary },
                    ]}
                  >
                    {formatMoney(data.totalValue)}
                  </Text>
                </View>

                <View style={styles.pnlPill}>
                  <Text
                    testID="portfolio-total-pnl"
                    style={[
                      theme.typography.caption,
                      styles.strong,
                      {
                        color:
                          data.totalPnl >= 0
                            ? theme.colors.success
                            : theme.colors.danger,
                      },
                    ]}
                  >
                    {formatSignedMoney(data.totalPnl)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {notice ? (
            <View
              testID="trade-notice"
              style={[
                styles.notice,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.success,
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <Text style={[theme.typography.body, { color: theme.colors.text }]}>
                {notice}
              </Text>
            </View>
          ) : null}

          {cached ? (
            <Text
              testID="portfolio-cached"
              style={[
                theme.typography.caption,
                { color: theme.colors.textMuted },
              ]}
            >
              Showing last synced portfolio from {formatTimestamp(data.updatedAt)}.
            </Text>
          ) : null}

          <View style={styles.sectionHeader}>
            <Text style={[theme.typography.heading, { color: theme.colors.text }]}>
              Holdings
            </Text>
            <Text
              style={[theme.typography.caption, { color: theme.colors.textMuted }]}
            >
              {quotes.length > 0 ? 'Live paper prices' : 'Virtual assets'}
            </Text>
          </View>

          {data.holdings.length === 0 ? (
            <Text
              style={[theme.typography.body, { color: theme.colors.textMuted }]}
            >
              No holdings yet. Start with a small virtual buy.
            </Text>
          ) : (
            <View
              style={[
                styles.holdings,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.lg,
                },
              ]}
            >
              {data.holdings.map((holding) => (
                <HoldingRow key={holding.symbol} holding={holding} />
              ))}
            </View>
          )}

          <Button
            label="Trade"
            onPress={() => setTradeOpen(true)}
            disabled={offline}
            size="lg"
            fullWidth
            testID="trade-open"
          />

          {offline ? (
            <Text
              testID="trade-offline-note"
              style={[theme.typography.caption, { color: theme.colors.textMuted }]}
            >
              Trading needs a connection. Your portfolio is shown from the last
              sync.
            </Text>
          ) : null}

          <Text
            style={[
              theme.typography.caption,
              styles.disclaimer,
              { color: theme.colors.textMuted },
            ]}
          >
            Virtual money only. No real funds, deposits, or withdrawals.
          </Text>
        </ScrollView>
      )}

      {data && tradeOpen && !offline ? (
        <TradeSheet
          visible
          cash={data.cash}
          holdings={data.holdings}
          onClose={() => setTradeOpen(false)}
          onTraded={(trade: Trade) => {
            setNotice(
              `${trade.side === 'buy' ? 'Bought' : 'Sold'} ${trade.quantity} ${trade.symbol}.`,
            );
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignSelf: 'center',
    gap: 16,
    maxWidth: 720,
    padding: 20,
    paddingBottom: 48,
    width: '100%',
  },
  walletLedge: {
    paddingBottom: 6,
  },
  wallet: {
    gap: 4,
    padding: 20,
  },
  kicker: {
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.8,
  },
  walletBottom: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  mutedOnPrimary: {
    opacity: 0.75,
  },
  pnlPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  strong: {
    fontWeight: '800',
  },
  notice: {
    borderWidth: 2,
    padding: 12,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  holdings: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  holding: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  symbolTile: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  holdingText: {
    flex: 1,
    gap: 2,
  },
  holdingValue: {
    alignItems: 'flex-end',
    gap: 2,
  },
  disclaimer: {
    textAlign: 'center',
  },
});
