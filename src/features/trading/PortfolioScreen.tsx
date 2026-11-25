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
import { ContentColumn } from '@/components/layout/ContentColumn';
import {
  Artwork,
  Button,
  Card,
  EmptyState,
  PageHeader,
} from '@/components/ui';
import { SyncBanner } from '@/offline/SyncBanner';
import { useSyncStatus } from '@/offline/useSyncStatus';
import { ledgeColors, textVariants } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { formatMoney, formatQuantity } from './formatMoney';
import { PnlPill } from './PnlPill';
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

  return (
    <View
      testID={`holding-${holding.symbol}`}
      style={[
        styles.holding,
        { borderBottomColor: theme.colors.border, gap: theme.spacing.sm },
      ]}
    >
      <View
        style={[
          styles.symbolTile,
          {
            backgroundColor: theme.colors.primarySoft,
            borderRadius: theme.radii.sm,
          },
        ]}
      >
        <Text style={[textVariants.bodyStrong, { color: theme.colors.focus }]}>
          {holding.symbol.slice(0, 1)}
        </Text>
      </View>

      <View style={styles.holdingText}>
        <Text style={[textVariants.bodyStrong, { color: theme.colors.text }]}>
          {holding.symbol}
        </Text>
        <Text
          style={[theme.typography.caption, { color: theme.colors.textMuted }]}
        >
          {formatQuantity(holding.quantity)} · {formatMoney(holding.currentPrice)}
        </Text>
      </View>

      <View style={styles.holdingValue}>
        <Text style={[textVariants.bodyStrong, { color: theme.colors.text }]}>
          {formatMoney(holding.value)}
        </Text>
        <PnlPill value={holding.pnl} testID={`holding-pnl-${holding.symbol}`} />
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
      <ContentColumn>
      <PageHeader
        title="Paper trading"
        tier="compact"
        onBack={() => router.back()}
      />

      <SyncBanner testID="portfolio-offline-banner" />

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
              styles.wallet,
              {
                backgroundColor: theme.colors.primary,
                borderBottomColor: ledgeColors.purple,
                borderRadius: theme.radii.lg,
                gap: theme.spacing.xxs,
                padding: theme.spacing.lg,
              },
            ]}
          >
            <View style={styles.walletTop}>
              <View style={styles.walletCash}>
                <Text
                  style={[textVariants.overline, { color: theme.colors.onPrimary }]}
                >
                  Virtual cash
                </Text>
                <Text
                  style={[
                    theme.typography.display,
                    { color: theme.colors.onPrimary },
                  ]}
                >
                  {formatMoney(data.cash)}
                </Text>
              </View>
              <View
                style={[
                  styles.walletArt,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: theme.radii.md,
                  },
                ]}
              >
                <Artwork name="wallet" size={56} />
              </View>
            </View>

            <View style={styles.walletBottom}>
              <View>
                <Text
                  style={[
                    theme.typography.caption,
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
              <PnlPill value={data.totalPnl} testID="portfolio-total-pnl" />
            </View>
          </View>

          {notice ? (
            <View
              testID="trade-notice"
              style={[
                styles.notice,
                {
                  backgroundColor: theme.colors.successSoft,
                  borderColor: ledgeColors.mint,
                  borderRadius: theme.radii.md,
                },
              ]}
            >
              <Text style={[textVariants.bodyStrong, { color: theme.colors.text }]}>
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
            <Card padded={false}>
              {data.holdings.map((holding) => (
                <HoldingRow key={holding.symbol} holding={holding} />
              ))}
            </Card>
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

      </ContentColumn>

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
    gap: 16,
    padding: 16,
    paddingBottom: 48,
  },
  wallet: {
    borderBottomWidth: 6,
  },
  walletTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletArt: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  walletCash: {
    flexShrink: 1,
  },
  walletBottom: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  holding: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
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
    gap: 4,
  },
  disclaimer: {
    textAlign: 'center',
  },
});
