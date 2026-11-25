import { useQueryClient } from '@tanstack/react-query';
import { randomUUID } from 'expo-crypto';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useApi } from '@/api/ApiProvider';
import type { Holding, Trade } from '@/api/contracts';
import { Button, Chip, Sheet, TextField } from '@/components/ui';
import { ledgeColors, textVariants } from '@/theme/tokens';
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
        {TRADE_SYMBOLS.map((entry) => (
          <Chip
            key={entry}
            label={entry}
            selected={entry === symbol}
            onPress={() => selectSymbol(entry)}
            testID={`trade-symbol-${entry}`}
          />
        ))}
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
                  textVariants.overline,
                  {
                    color: selected
                      ? entry === 'buy'
                        ? theme.colors.onSuccess
                        : theme.colors.onDanger
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
          style={[textVariants.bodyStrong, { color: theme.colors.text }]}
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
            style={[textVariants.label, { color: theme.colors.text }]}
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
            style={[textVariants.label, { color: theme.colors.text }]}
            testID="trade-estimate"
          >
            {side === 'buy'
              ? formatMoney(estimate)
              : `${formatQuantity(owned)} ${symbol}`}
          </Text>
        </View>
      </View>

      {error ? (
        <View
          style={[
            styles.error,
            {
              backgroundColor: theme.colors.dangerSoft,
              borderColor: ledgeColors.coral,
              borderRadius: theme.radii.md,
            },
          ]}
        >
          <Text
            accessibilityRole="alert"
            testID="trade-error"
            style={[textVariants.label, { color: theme.colors.text }]}
          >
            {error}
          </Text>
        </View>
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
    flexWrap: 'wrap',
    gap: 8,
  },
  segment: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  quoteRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summary: {
    gap: 6,
  },
  error: {
    borderWidth: 2,
    padding: 12,
  },
});
