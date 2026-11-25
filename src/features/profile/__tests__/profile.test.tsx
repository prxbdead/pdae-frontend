import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import type { Achievement } from '@/api/contracts';
import { mockUser } from '@/api/fixtures';
import { MockApiClient } from '@/api/mock';
import { toLocalDateKey } from '@/features/gamification/streak';
import type { SyncStatus } from '@/offline/types';
import { useSessionStore } from '@/auth/sessionStore';
import { useProgressStore } from '@/stores/progressStore';
import { resetApiMock, setApiMockClient } from '@/testing/api-mock';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { ProfileScreen } from '../ProfileScreen';

jest.mock('@/api/ApiProvider', () => require('@/testing/api-mock'));
jest.mock('expo-router', () => require('@/testing/expo-router-mock'));

const today = new Date();
const todayKey = toLocalDateKey(today);
const user = {
  ...mockUser,
  xp: 120,
  streak: {
    ...mockUser.streak,
    current: 3,
    longest: 3,
    lastLessonDate: todayKey,
  },
};

const achievements: Achievement[] = [
  {
    id: 'earned',
    title: 'First steps',
    description: 'Complete your first lesson.',
    icon: 'star',
    earnedAt: '2026-11-01T09:00:00.000Z',
    progress: 1,
    target: 1,
  },
  {
    id: 'locked',
    title: 'Seven-day streak',
    description: 'Keep a lesson streak alive for seven days.',
    icon: 'fire',
    earnedAt: null,
    progress: 3,
    target: 7,
  },
];

const mockAchievementsQuery = {
  data: achievements,
  isLoading: false,
  error: null,
  isLocal: false,
  refresh: jest.fn(),
};

const mockSyncStatus: SyncStatus = {
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
};

jest.mock('../useAchievements', () => ({
  useAchievements: () => mockAchievementsQuery,
}));

jest.mock('@/offline/useSyncStatus', () => ({
  useSyncStatus: () => mockSyncStatus,
}));

let client: MockApiClient;

beforeEach(() => {
  resetApiMock();
  client = new MockApiClient();
  setApiMockClient(client);
  mockSyncStatus.state = 'idle';
  mockAchievementsQuery.data = achievements;
  mockAchievementsQuery.isLocal = false;
  useSessionStore.setState({ status: 'authenticated', user });
  useProgressStore.setState({
    userId: user.id,
    lessons: {
      'foundations-1': {
        lessonId: 'foundations-1',
        status: 'completed',
        bestScore: 1,
        attempts: 1,
      },
      'foundations-2': {
        lessonId: 'foundations-2',
        status: 'in_progress',
        bestScore: 0.5,
        attempts: 1,
      },
    },
    pendingXp: 0,
    streak: {
      current: 3,
      longest: 3,
      lastLessonDate: todayKey,
      freezesEquipped: 0,
      restDay: null,
    },
    xpToday: 20,
    dailyGoalXp: 30,
  });
});

function renderScreen() {
  return render(
    <ThemeProvider>
      <ProfileScreen />
    </ThemeProvider>,
  );
}

describe('ProfileScreen', () => {
  it('renders identity, stats, and accuracy from local results', () => {
    renderScreen();

    expect(screen.getByText('Robin')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-avatar')).toHaveTextContent('R');
    expect(screen.getByTestId('profile-stat-xp')).toHaveTextContent(/120/);
    expect(screen.getByTestId('profile-stat-streak')).toHaveTextContent(
      /3 days/,
    );
    expect(screen.getByTestId('profile-stat-lessons')).toHaveTextContent(/1/);
    expect(screen.getByTestId('profile-stat-accuracy')).toHaveTextContent(/75%/);
  });

  it('marks the last lesson day on the streak calendar', () => {
    renderScreen();

    const day = screen.getByTestId(`streak-day-${todayKey}`);

    expect(day.props.accessibilityLabel).toContain('lesson completed');
    expect(day.props.accessibilityLabel).toContain('today');
  });

  it('styles earned badges and shows progress on locked ones', () => {
    renderScreen();

    expect(screen.getByTestId('badge-earned')).toHaveTextContent(/Earned/);
    expect(screen.getByTestId('badge-locked')).toHaveTextContent(/3 \/ 7/);

    fireEvent.press(screen.getByTestId('badge-locked'));

    expect(screen.getByTestId('badge-detail')).toHaveTextContent(
      /Keep a lesson streak alive for seven days\./,
    );
  });

  it('keeps profile links disabled until their routes ship', () => {
    renderScreen();

    expect(screen.getByTestId('profile-settings').props.accessibilityState).toMatchObject(
      { disabled: true },
    );
    expect(
      screen.getByTestId('profile-disclaimer').props.accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it('shows the saved profile while offline', () => {
    mockSyncStatus.state = 'offline';
    renderScreen();

    expect(screen.getByTestId('profile-offline-banner')).toBeOnTheScreen();
    expect(screen.getByTestId('profile-cached')).toHaveTextContent(
      /Showing your saved profile/,
    );
  });

  it('updates the display name and guide through the API', async () => {
    const update = jest.spyOn(client.profile, 'update').mockResolvedValue({
      ...user,
      displayName: 'Robin Hood',
      characterId: 'chip',
    });

    renderScreen();

    fireEvent.press(screen.getByTestId('profile-edit'));
    fireEvent.changeText(screen.getByTestId('profile-name'), 'Robin Hood');
    fireEvent.press(screen.getByTestId('character-chip-chip'));
    fireEvent.press(screen.getByTestId('profile-save'));

    await waitFor(() => expect(update).toHaveBeenCalled());

    expect(update).toHaveBeenCalledWith({
      displayName: 'Robin Hood',
      characterId: 'chip',
    });
    expect(await screen.findByText('Robin Hood')).toBeOnTheScreen();
  });
});
