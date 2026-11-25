import { fireEvent, render, screen } from '@testing-library/react-native';

import { mockLeaderboard } from '@/api/fixtures';
import type { SyncStatus } from '@/offline/types';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { LeaguesScreen } from '../LeaguesScreen';
import type { LeaderboardQuery } from '../useLeaderboard';

const leaderboard = {
  ...mockLeaderboard,
  endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
};

const mockLeaderboardQuery: LeaderboardQuery = {
  data: leaderboard,
  isLoading: false,
  error: null,
  isStale: false,
  refresh: jest.fn(),
};

const mockSyncStatus: SyncStatus = {
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
};

jest.mock('../useLeaderboard', () => ({
  useLeaderboard: () => mockLeaderboardQuery,
}));

jest.mock('@/offline/useSyncStatus', () => ({
  useSyncStatus: () => mockSyncStatus,
}));

beforeEach(() => {
  mockLeaderboardQuery.data = leaderboard;
  mockLeaderboardQuery.isLoading = false;
  mockLeaderboardQuery.error = null;
  mockLeaderboardQuery.isStale = false;
  mockSyncStatus.state = 'idle';
});

function renderScreen() {
  return render(
    <ThemeProvider>
      <LeaguesScreen />
    </ThemeProvider>,
  );
}

describe('LeaguesScreen', () => {
  it('renders all 30 places with ranks, names, and XP', () => {
    renderScreen();

    const places = screen.getAllByTestId(/^leaderboard-(entry|podium)-/);

    expect(places).toHaveLength(30);
    expect(screen.getByTestId('leaderboard-podium-1')).toBeOnTheScreen();
    expect(screen.getByTestId('leaderboard-entry-user-mock-1')).toBeOnTheScreen();
    expect(screen.getAllByText(/XP$/).length).toBeGreaterThan(0);
  });

  it('highlights the current user', () => {
    renderScreen();

    const row = screen.getByTestId('leaderboard-entry-user-mock-1');

    expect(row.props.accessibilityLabel).toContain(', you');
    expect(screen.getByTestId('leaderboard-you')).toBeOnTheScreen();
  });

  it('shows the tier badge, league name, and countdown', () => {
    renderScreen();

    expect(screen.getByTestId('tier-badge-bronze')).toBeOnTheScreen();
    expect(screen.getByText('Bronze league')).toBeOnTheScreen();
    expect(screen.getByTestId('league-countdown')).toHaveTextContent(
      /^Ends in /,
    );
  });

  it('labels the promotion and demotion zones', () => {
    renderScreen();

    expect(screen.getByTestId('leaderboard-promotion')).toHaveTextContent(
      'Promotion zone · top 5',
    );
    expect(screen.getByTestId('leaderboard-demotion')).toHaveTextContent(
      'Demotion zone · bottom 5',
    );
  });

  it('shows cached standings with a banner while offline', () => {
    mockSyncStatus.state = 'offline';
    mockLeaderboardQuery.isStale = true;
    renderScreen();

    expect(
      screen.getByTestId('leaderboard-offline-banner'),
    ).toBeOnTheScreen();
    expect(screen.getByTestId('leaderboard-cached')).toHaveTextContent(
      /Showing last synced standings/,
    );
    expect(screen.getByTestId('leaderboard-podium-1')).toBeOnTheScreen();
  });

  it('shows an empty state when there is no cache', () => {
    mockLeaderboardQuery.data = null;
    mockLeaderboardQuery.error = new Error('offline');
    renderScreen();

    expect(screen.getByText("Couldn't load your league")).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Retry'));

    expect(mockLeaderboardQuery.refresh).toHaveBeenCalled();
  });
});
