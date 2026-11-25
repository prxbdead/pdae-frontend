import { fireEvent, render, screen } from '@testing-library/react-native';

import type { SyncStatus } from '@/offline/types';
import { routerMock } from '@/testing/expo-router-mock';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { SyncBanner } from '../SyncBanner';

const mockStatus: SyncStatus = {
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
};

const mockFlush = jest.fn(async () => mockStatus);

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));

jest.mock('@/offline/useSyncStatus', () => ({
  useSyncStatus: () => mockStatus,
}));

jest.mock('@/offline/SyncProvider', () => ({
  useSyncOptional: () => ({ flush: mockFlush, enqueue: jest.fn() }),
}));

function renderBanner() {
  return render(
    <ThemeProvider>
      <SyncBanner testID="test-sync-banner" />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockStatus.state = 'idle';
  mockStatus.pending = 0;
});

describe('SyncBanner', () => {
  it('stays hidden when sync is idle', () => {
    renderBanner();

    expect(screen.queryByTestId('test-sync-banner')).toBeNull();
  });

  it('shows the pending count while syncing', () => {
    mockStatus.state = 'syncing';
    mockStatus.pending = 2;

    renderBanner();

    expect(screen.getByText('Syncing 2 saved results…')).toBeOnTheScreen();
  });

  it('offers Retry while offline and flushes the queue', () => {
    mockStatus.state = 'offline';
    mockStatus.pending = 1;

    renderBanner();

    fireEvent.press(screen.getByText('Retry'));

    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('routes to login when the session needs to be renewed', () => {
    mockStatus.state = 'paused_auth';
    mockStatus.pending = 1;

    renderBanner();
    fireEvent.press(screen.getByText('Sign in to sync'));

    expect(routerMock.push).toHaveBeenCalledWith('/login');
  });
});
