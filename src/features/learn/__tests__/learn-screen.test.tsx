import { fireEvent, render, screen } from '@testing-library/react-native';

import { mockUser } from '@/api/fixtures';
import { useSessionStore } from '@/auth/sessionStore';
import { mockPack } from '@/content/fixtures/pack';
import type { SyncStatus } from '@/offline/types';
import { useProgressStore } from '@/stores/progressStore';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { routerMock } from '@/testing/expo-router-mock';

import { LearnScreen } from '../LearnScreen';
import { scrollToUnit } from '../JumpToUnitSheet';

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));

const mockRepository = {
  getPack: jest.fn(),
  refresh: jest.fn(),
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
      <LearnScreen />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  mockRepository.getPack.mockResolvedValue(mockPack);
  mockRepository.refresh.mockResolvedValue(mockPack);
  mockSyncStatus.state = 'idle';
  useSessionStore.setState({
    status: 'authenticated',
    user: mockUser,
  });
  useProgressStore.setState({ userId: mockUser.id, lessons: {} });
  routerMock.push.mockClear();
});

describe('LearnScreen', () => {
  it('renders the current unit banner with the teacher name', async () => {
    renderScreen();

    expect(await screen.findByText('UNIT 1 · HODLO')).toBeOnTheScreen();
    expect(screen.getByTestId('unit-banner-foundations')).toBeOnTheScreen();
  });

  it('labels completed and available nodes', async () => {
    useProgressStore.setState({
      lessons: {
        'foundations-1': {
          lessonId: 'foundations-1',
          status: 'completed',
          attempts: 2,
          bestScore: 1,
        },
      },
    });

    renderScreen();

    const completed = await screen.findByTestId('path-node-foundations-1');
    const available = screen.getByTestId('path-node-foundations-2');

    expect(completed.props.accessibilityLabel).toBe('Lesson 1, completed');
    expect(available.props.accessibilityLabel).toBe('Lesson 2, available');
  });

  it('shows in-progress lessons with a progress ring', async () => {
    useProgressStore.setState({
      lessons: {
        'foundations-1': {
          lessonId: 'foundations-1',
          status: 'in_progress',
          attempts: 1,
        },
      },
    });

    renderScreen();

    const node = await screen.findByTestId('path-node-foundations-1');

    expect(node.props.accessibilityLabel).toBe('Lesson 1, in progress');
    expect(screen.getByLabelText('Lesson 1 progress')).toBeOnTheScreen();
  });

  it('does nothing when a locked node is pressed', async () => {
    renderScreen();

    fireEvent.press(await screen.findByTestId('path-node-foundations-2'));

    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it('opens the lesson intro when an available node is pressed', async () => {
    renderScreen();

    fireEvent.press(await screen.findByTestId('path-node-foundations-1'));

    expect(routerMock.push).toHaveBeenCalledWith('/lesson/foundations-1');
  });

  it('shows the completed fraction in the unit progress ring', async () => {
    useProgressStore.setState({
      lessons: {
        'foundations-1': {
          lessonId: 'foundations-1',
          status: 'completed',
          attempts: 1,
        },
      },
    });

    renderScreen();

    const ring = await screen.findByLabelText('Unit 1 progress');

    expect(ring.props.accessibilityValue).toMatchObject({ now: 0.5 });
  });

  it('shows the offline banner without blocking the path', async () => {
    mockSyncStatus.state = 'offline';

    renderScreen();

    expect(await screen.findByTestId('learn-offline-banner')).toBeOnTheScreen();
    expect(screen.getByTestId('path-node-foundations-1')).toBeOnTheScreen();
  });

  it('opens the jump sheet and closes it after choosing a unit', async () => {
    renderScreen();

    fireEvent.press(await screen.findByTestId('unit-jump-foundations'));

    const option = await screen.findByTestId('jump-unit-price-action');

    fireEvent.press(option);

    expect(screen.queryByTestId('jump-unit-price-action')).toBeNull();
  });

  it('scrolls the path to a measured unit offset', () => {
    const ref = { scrollTo: jest.fn() };

    scrollToUnit(ref, 320);

    expect(ref.scrollTo).toHaveBeenCalledWith({ y: 320, animated: true });
  });
});
