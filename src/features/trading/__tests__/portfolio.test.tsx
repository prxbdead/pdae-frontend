import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { mockPortfolio } from '@/api/fixtures';
import { MockApiClient } from '@/api/mock';
import type { SyncStatus } from '@/offline/types';
import { resetApiMock, setApiMockClient } from '@/testing/api-mock';
import { routerMock } from '@/testing/expo-router-mock';
import { palette } from '@/theme/tokens';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { PortfolioScreen } from '../PortfolioScreen';

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));
jest.mock('@/api/ApiProvider', () => require('@/testing/api-mock'));
jest.mock('@/offline/useSyncStatus', () => ({
  useSyncStatus: () => mockSyncStatus,
}));

const mockSyncStatus: SyncStatus = {
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
};

let client: MockApiClient;

beforeEach(async () => {
  resetApiMock();
  client = new MockApiClient();
  setApiMockClient(client);
  mockSyncStatus.state = 'idle';
  routerMock.back.mockClear();
  await client.auth.login({
    email: 'learner@hodlo.app',
    password: 'password123',
  });
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function renderScreen(queryClient = makeQueryClient()) {
  return render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <PortfolioScreen />
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe('PortfolioScreen', () => {
  it('renders cash, total value, holdings, and P&L', async () => {
    renderScreen();

    expect(await screen.findByTestId('holding-BTC')).toBeOnTheScreen();
    expect(screen.getByText('$5,000.00')).toBeOnTheScreen();
    expect(screen.getByText('$8,250.00')).toBeOnTheScreen();
    expect(screen.getByTestId('portfolio-total-pnl')).toHaveTextContent(
      '+$250.00',
    );
    expect(screen.getByTestId('holding-pnl-BTC')).toHaveTextContent(
      '+$250.00',
    );
    expect(screen.getByText('BTC')).toBeOnTheScreen();
  });

  it('uses mint for a positive P&L and coral for a negative one', async () => {
    const positive = renderScreen();

    expect(await screen.findByTestId('portfolio-total-pnl')).toHaveStyle({
      color: palette.mint,
    });

    positive.unmount();

    jest.spyOn(client.trading, 'getPortfolio').mockResolvedValue({
      ...mockPortfolio,
      totalPnl: -100,
      holdings: mockPortfolio.holdings.map((holding) => ({
        ...holding,
        pnl: -100,
      })),
    });

    renderScreen();

    expect(await screen.findByTestId('portfolio-total-pnl')).toHaveStyle({
      color: palette.coral,
    });
  });

  it('opens the trade sheet from the online portfolio', async () => {
    renderScreen();

    await screen.findByTestId('holding-BTC');
    fireEvent.press(screen.getByTestId('trade-open'));

    expect(await screen.findByTestId('trade-submit')).toBeOnTheScreen();
  });

  it('shows the cached portfolio and disables trading while offline', async () => {
    const queryClient = makeQueryClient();
    const first = renderScreen(queryClient);

    await screen.findByTestId('holding-BTC');
    first.unmount();

    mockSyncStatus.state = 'offline';
    renderScreen(queryClient);

    expect(
      await screen.findByTestId('portfolio-offline-banner'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('portfolio-cached')).toHaveTextContent(
      /Showing last synced portfolio from /,
    );
    expect(screen.getByTestId('trade-open').props.accessibilityState).toMatchObject(
      { disabled: true },
    );
    expect(screen.getByTestId('trade-offline-note')).toHaveTextContent(
      'Trading needs a connection. Your portfolio is shown from the last sync.',
    );
  });
});
