import { fireEvent, render, screen } from '@testing-library/react-native';

import { mockUser } from '@/api/fixtures';
import { mockPack } from '@/content/fixtures/pack';
import type { SyncStatus } from '@/offline/types';
import { useProgressStore } from '@/stores/progressStore';
import { routerMock } from '@/testing/expo-router-mock';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { PracticeScreen } from '../PracticeScreen';

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));

const mockRepository = {
  getPack: jest.fn(),
};

const mockSyncStatus: SyncStatus = {
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
};

jest.mock('@/content/ContentProvider', () => ({
  useContent: () => mockRepository,
}));

jest.mock('@/offline/useSyncStatus', () => ({
  useSyncStatus: () => mockSyncStatus,
}));

function renderScreen() {
  return render(
    <ThemeProvider>
      <PracticeScreen />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  mockRepository.getPack.mockReset();
  mockRepository.getPack.mockResolvedValue(mockPack);
  mockSyncStatus.state = 'idle';
  routerMock.push.mockClear();
  useProgressStore.setState({
    userId: mockUser.id,
    lessons: {},
    mistakeIds: ['foundations-1-e1'],
  });
});

describe('PracticeScreen', () => {
  it('renders all seven practice cards', async () => {
    renderScreen();

    await screen.findByTestId('practice-card-mistakes');

    for (const kind of [
      'mistakes',
      'chart',
      'scam',
      'risk',
      'dca',
      'trading',
      'flashcards',
    ]) {
      expect(screen.getByTestId(`practice-card-${kind}`)).toBeOnTheScreen();
    }
  });

  it('shows the mistake count badge', async () => {
    useProgressStore.setState({
      mistakeIds: ['foundations-1-e1', 'foundations-1-e2'],
    });

    renderScreen();

    expect(await screen.findByText('2 to review')).toBeOnTheScreen();
  });

  it('disables mistakes review when there are no mistakes', async () => {
    useProgressStore.setState({ mistakeIds: [] });

    renderScreen();

    expect(await screen.findByText('No mistakes yet')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('practice-card-mistakes'));

    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('navigates to a drill lesson', async () => {
    renderScreen();

    fireEvent.press(await screen.findByTestId('practice-card-chart'));

    expect(routerMock.push).toHaveBeenCalledWith('/lesson/price-action-1');
  });

  it('navigates to paper trading', async () => {
    renderScreen();

    fireEvent.press(await screen.findByTestId('practice-card-trading'));

    expect(routerMock.push).toHaveBeenCalledWith('/practice/trading');
  });

  it('shows the offline banner', async () => {
    mockSyncStatus.state = 'offline';

    renderScreen();

    expect(
      await screen.findByTestId('practice-offline-banner'),
    ).toBeOnTheScreen();
  });

  it('shows an empty state when the downloaded pack cannot be read', async () => {
    mockRepository.getPack.mockRejectedValue(new Error('missing pack'));

    renderScreen();

    expect(
      await screen.findByText("Couldn't load practice"),
    ).toBeOnTheScreen();
  });
});
