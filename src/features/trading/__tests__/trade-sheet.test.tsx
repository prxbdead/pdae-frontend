import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { MockApiClient } from '@/api/mock';
import { mockPortfolio } from '@/api/fixtures';
import { resetApiMock, setApiMockClient } from '@/testing/api-mock';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { TradeSheet } from '../TradeSheet';

jest.mock('@/api/ApiProvider', () => require('@/testing/api-mock'));

let client: MockApiClient;

beforeEach(async () => {
  resetApiMock();
  client = new MockApiClient();
  setApiMockClient(client);
  await client.auth.login({
    email: 'learner@hodlo.app',
    password: 'password123',
  });
});

function renderSheet(
  overrides: Partial<ComponentProps<typeof TradeSheet>> = {},
) {
  const onClose = jest.fn();
  const onTraded = jest.fn();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries');

  render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TradeSheet
          visible
          cash={mockPortfolio.cash}
          holdings={mockPortfolio.holdings}
          onClose={onClose}
          onTraded={onTraded}
          {...overrides}
        />
      </QueryClientProvider>
    </ThemeProvider>,
  );

  return { onClose, onTraded, invalidate };
}

async function waitForPrice() {
  expect(await screen.findByText('$65,000.00')).toBeOnTheScreen();
}

describe('TradeSheet', () => {
  it.each([
    ['empty', ''],
    ['zero', '0'],
    ['negative', '-1'],
    ['not a number', 'abc'],
  ])('rejects a %s quantity', async (_label, quantity) => {
    renderSheet();
    await waitForPrice();

    if (quantity) {
      fireEvent.changeText(screen.getByTestId('trade-quantity'), quantity);
    }

    fireEvent.press(screen.getByTestId('trade-submit'));

    expect(await screen.findByTestId('trade-error')).toHaveTextContent(
      'Enter a quantity greater than zero.',
    );
  });

  it('rejects a buy above available cash', async () => {
    const placeTrade = jest.spyOn(client.trading, 'placeTrade');

    renderSheet();
    await waitForPrice();

    fireEvent.changeText(screen.getByTestId('trade-quantity'), '1');
    fireEvent.press(screen.getByTestId('trade-submit'));

    expect(await screen.findByTestId('trade-error')).toHaveTextContent(
      'Not enough virtual cash for that buy.',
    );
    expect(placeTrade).not.toHaveBeenCalled();
  });

  it('rejects a sell larger than the holding', async () => {
    const placeTrade = jest.spyOn(client.trading, 'placeTrade');

    renderSheet();
    await waitForPrice();

    fireEvent.press(screen.getByTestId('trade-side-sell'));
    fireEvent.changeText(screen.getByTestId('trade-quantity'), '1');
    fireEvent.press(screen.getByTestId('trade-submit'));

    expect(await screen.findByTestId('trade-error')).toHaveTextContent(
      'You only own 0.05 BTC.',
    );
    expect(placeTrade).not.toHaveBeenCalled();
  });

  it('shows the estimated cost for the entered quantity', async () => {
    renderSheet();
    await waitForPrice();

    fireEvent.changeText(screen.getByTestId('trade-quantity'), '0.01');

    expect(screen.getByTestId('trade-estimate')).toHaveTextContent('$650.00');
  });

  it('places a trade with an idempotency key and refreshes the portfolio', async () => {
    const { onClose, onTraded, invalidate } = renderSheet();
    const placeTrade = jest.spyOn(client.trading, 'placeTrade');
    await waitForPrice();

    fireEvent.changeText(screen.getByTestId('trade-quantity'), '0.01');
    fireEvent.press(screen.getByTestId('trade-submit'));

    await waitFor(() => expect(onTraded).toHaveBeenCalled());

    expect(placeTrade).toHaveBeenCalledWith(
      { symbol: 'BTC', side: 'buy', quantity: 0.01 },
      'test-uuid',
    );
    expect(onClose).toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['portfolio'] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['quotes'] });
  });

  it('shows server validation errors inside the sheet', async () => {
    jest
      .spyOn(client.trading, 'placeTrade')
      .mockRejectedValue(new Error('Symbol paused'));

    const { onClose, onTraded } = renderSheet();
    await waitForPrice();

    fireEvent.changeText(screen.getByTestId('trade-quantity'), '0.01');
    fireEvent.press(screen.getByTestId('trade-submit'));

    expect(await screen.findByText('Symbol paused')).toBeOnTheScreen();
    expect(onClose).not.toHaveBeenCalled();
    expect(onTraded).not.toHaveBeenCalled();
  });
});
