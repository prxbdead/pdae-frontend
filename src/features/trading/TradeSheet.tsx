import { useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApi } from '@/api/ApiProvider';
import type { Holding, Trade } from '@/api/contracts';
import { Button, Sheet, TextField } from '@/components/ui';
import { useTheme } from '@/theme/useTheme';

import { formatMoney, formatQuantity } from './formatMoney';
import { TRADE_SYMBOLS, useQuotes } from './usePortfolio';

export interface TradeSheetProps {
  visible: boolean;
  cash: number;
  holdings: Holding[];
  onClose(): void;
  onTraded(trade: Trade): void;
}

type Side = 'buy' | 'sell';

function heldQuantity(holdings: Holding[], symbol: string): number {
  return holdings.find((holding) => holding.symbol === symbol)?.quantity ?? 0;
}

export function TradeSheet({
  visible,
  cash,
  holdings,
  onClose,
  onTraded,
}: TradeSheetProps) {
  const theme = useTheme();
  const { client } = useApi();
  const queryClient = useQueryClient();
  const { data: quotes, isLoading: quotesLoading } = useQuotes(TRADE_SYMBOLS);
  const [symbol, setSymbol] = useState<string>(TRADE_SYMBOLS[0]);
  const [side, setSide] = useState<Side>('buy');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const quote = quotes.find((entry) => entry.symbol === symbol);
  const parsed = Number(quantity.replace(',', '.'));
  const validQuantity = Number.isFinite(parsed) && parsed > 0;
  const estimate = quote && validQuantity ? parsed * quote.price : 0;
  const owned = heldQuantity(holdings, symbol);

  const selectSymbol = (next: string) => {
    setSymbol(next);
    setError(null);
  };

  const selectSide = (next: Side) => {
    setSide(next);
    setError(null);
  };

  const submit = async () => {
    setError(null);

    if (!validQuantity) {
      setError('Enter a quantity greater than zero.');

      return;
    }

    if (!quote) {
      setError('A price is not available for that symbol yet.');

      return;
    }

    if (side === 'buy' && estimate > cash + 0.000001) {
      setError('Not enough virtual cash for that buy.');

      return;
    }

    if (side === 'sell' && parsed > owned + 0.000001) {
      setError(`You only own ${formatQuantity(owned)} ${symbol}.`);

      return;
    }

    setSubmitting(true);

    try {
      const trade = await client.trading.placeTrade(
        { symbol, side, quantity: parsed },
        randomUUID(),
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
        queryClient.invalidateQueries({ queryKey: ['quotes'] }),
      ]);
      onClose();
      onTraded(trade);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : 'The trade could not be placed.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet visible={visible} title="Trade" onClose={onClose}>
      <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
        Virtual money — not financial advice.
      </Text>

      <View style={styles.symbols}>
        {TRADE_SYMBOLS.map((entry) => {
          const selected = entry === symbol;

          return (
            <Pressable
              key={entry}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => selectSymbol(entry)}
              testID={`trade-symbol-${entry}`}
              style={[
                styles.symbol,
                {
                  backgroundColor: selected
                    ? theme.colors.secondary
                    : theme.colors.surfaceAlt,
                  borderColor: selected
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.symbolText,
                  { color: theme.colors.text },
                ]}
              >
                {entry}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={[
          styles.segment,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderRadius: theme.radii.pill,
          },
        ]}
      >
        {(['buy', 'sell'] as const).map((entry) => {
          const selected = entry === side;

          return (
            <Pressable
              key={entry}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => selectSide(entry)}
              testID={`trade-side-${entry}`}
              style={[
                styles.segmentButton,
                {
                  backgroundColor: selected
                    ? entry === 'buy'
                      ? theme.colors.success
                      : theme.colors.danger
                    : 'transparent',
                  borderRadius: theme.radii.pill,
                },
              ]}
            >
              <Text
                style={[
                  theme.typography.caption,
                  styles.segmentText,
                  {
                    color: selected
                      ? theme.colors.onSuccess
                      : theme.colors.textMuted,
                  },
                ]}
              >
                {entry === 'buy' ? 'Buy' : 'Sell'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.quoteRow}>
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          {symbol} price
        </Text>
        <Text
          style={[theme.typography.body, styles.strong, { color: theme.colors.text }]}
        >
          {quote ? formatMoney(quote.price) : quotesLoading ? '…' : '—'}
        </Text>
      </View>

      <TextField
        label="Quantity"
        value={quantity}
        onChangeText={(value) => {
          setQuantity(value);
          setError(null);
        }}
        keyboardType="decimal-pad"
        placeholder="0.00"
        testID="trade-quantity"
      />

      <View style={styles.summary}>
        <View style={styles.quoteRow}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            Available cash
          </Text>
          <Text
            style={[theme.typography.caption, styles.strong, { color: theme.colors.text }]}
          >
            {formatMoney(cash)}
          </Text>
        </View>
        <View style={styles.quoteRow}>
          <Text
            style={[theme.typography.caption, { color: theme.colors.textMuted }]}
          >
            {side === 'buy' ? 'Estimated cost' : 'You own'}
          </Text>
          <Text
            style={[theme.typography.caption, styles.strong, { color: theme.colors.text }]}
            testID="trade-estimate"
          >
            {side === 'buy'
              ? formatMoney(estimate)
              : `${formatQuantity(owned)} ${symbol}`}
          </Text>
        </View>
      </View>

      {error ? (
        <Text
          accessibilityRole="alert"
          testID="trade-error"
          style={[theme.typography.caption, { color: theme.colors.danger }]}
        >
          {error}
        </Text>
      ) : null}

      <Button
        label={side === 'buy' ? `Buy ${symbol}` : `Sell ${symbol}`}
        onPress={() => {
          void submit();
        }}
        loading={submitting}
        fullWidth
        testID="trade-submit"
      />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  symbols: {
    flexDirection: 'row',
    gap: 8,
  },
  symbol: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    minWidth: 64,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  symbolText: {
    fontWeight: '800',
  },
  segment: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
  },
  segmentText: {
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  quoteRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  strong: {
    fontWeight: '800',
  },
  summary: {
    gap: 6,
  },
});
