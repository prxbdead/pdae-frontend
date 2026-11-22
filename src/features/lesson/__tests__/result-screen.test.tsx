import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Achievement, AttemptResult } from '@/api/contracts';
import { toLocalDateKey } from '@/features/gamification/streak';
import type { LocalAttemptResult, SyncStatus } from '@/offline/types';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { routerMock } from '@/testing/expo-router-mock';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { ResultScreen } from '../ResultScreen';

jest.mock('expo-router', () => require('@/testing/expo-router-mock'));

jest.mock('@/offline/useSyncStatus', () => ({
  useSyncStatus: () => mockSyncStatus,
}));

jest.mock('../useLesson', () => ({
  useLesson: () => mockLessonDetail,
}));

const mockSyncStatus: SyncStatus = {
  state: 'idle',
  pending: 0,
  lastSyncedAt: null,
};

const mockLessonDetail = {
  lesson: { id: 'foundations-1', xpReward: 40 },
  module: { id: 'foundations', teacherCharacterId: 'chip' },
  isLoading: false,
  error: false,
  retry: jest.fn(),
};

const localResult: LocalAttemptResult = {
  clientAttemptId: 'attempt-1',
  lessonId: 'foundations-1',
  startedAt: new Date(2026, 0, 1, 12, 0).toISOString(),
  completedAt: new Date(2026, 0, 1, 12, 3).toISOString(),
  answers: [],
  score: 0.8,
  passed: true,
  xpEarned: 80,
  heartsLost: 1,
  mistakes: [],
};

const achievement: Achievement = {
  id: 'first-steps',
  title: 'Perfect lesson',
  description: 'Finish a lesson with no mistakes.',
  icon: 'star',
  earnedAt: '2026-01-01T12:03:00.000Z',
  progress: 1,
  target: 1,
};

const serverResult: AttemptResult = {
  attemptId: 'server-1',
  clientAttemptId: 'attempt-1',
  lessonId: 'foundations-1',
  score: 1,
  passed: true,
  xpEarned: 110,
  hearts: 5,
  streak: {
    current: 5,
    longest: 7,
    lastLessonDate: '2026-01-01',
    freezesEquipped: 0,
    restDay: null,
  },
  levelUp: { level: 4, title: 'Chart reader' },
  newAchievements: [achievement],
};

function renderScreen(
  lessonId = 'foundations-1',
  attemptId: string | undefined = 'attempt-1',
) {
  return render(
    <ThemeProvider>
      <ResultScreen lessonId={lessonId} attemptId={attemptId} />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSyncStatus.state = 'idle';
  mockSyncStatus.pending = 0;
  useSettingsStore.setState({ reducedMotion: true });
  useProgressStore.setState({
    userId: 'user-1',
    lessons: {},
    pendingXp: 0,
    pendingXpByAttempt: {},
    lastResult: localResult,
    lastServerResult: null,
    xpToday: 120,
    xpTodayDate: toLocalDateKey(new Date()),
    dailyGoalXp: 30,
    streak: {
      current: 3,
      longest: 3,
      lastLessonDate: '2026-01-01',
      freezesEquipped: 0,
      restDay: null,
    },
  });
});

describe('ResultScreen', () => {
  it('shows XP, accuracy, time, streak, and daily goal', () => {
    renderScreen();

    expect(screen.getByText('+80 XP')).toBeOnTheScreen();
    expect(screen.getByText('80%')).toBeOnTheScreen();
    expect(screen.getByText('3:00')).toBeOnTheScreen();
    expect(screen.getByText('3 days')).toBeOnTheScreen();
    expect(screen.getByText(/120 \/ 30 XP/)).toBeOnTheScreen();
  });

  it('shows the pending state while the result is unsynced', () => {
    mockSyncStatus.pending = 1;
    renderScreen();

    expect(screen.getByTestId('result-pending')).toBeOnTheScreen();
    expect(screen.queryByTestId('result-synced')).toBeNull();
  });

  it('shows synced server values, achievements, and level-up', () => {
    useProgressStore.setState({
      lastServerResult: serverResult,
      streak: serverResult.streak,
      xpToday: 110,
    });

    renderScreen();

    expect(screen.getByTestId('result-synced')).toBeOnTheScreen();
    expect(screen.queryByTestId('result-pending')).toBeNull();
    expect(screen.getByText('+110 XP')).toBeOnTheScreen();
    expect(screen.getByText('100%')).toBeOnTheScreen();
    expect(screen.getByText('5 days')).toBeOnTheScreen();
    expect(screen.getByText('Perfect lesson')).toBeOnTheScreen();
    expect(screen.getByText('Level 4: Chart reader')).toBeOnTheScreen();
  });

  it('continues to Learn and opens mistakes practice', () => {
    renderScreen();

    fireEvent.press(screen.getByTestId('result-continue'));
    expect(routerMock.dismissTo).toHaveBeenCalledWith('/(tabs)/learn');

    fireEvent.press(screen.getByTestId('result-practice'));
    expect(routerMock.push).toHaveBeenCalledWith('/practice/mistakes');
  });

  it('refuses to render a result for another lesson', () => {
    renderScreen('price-action-1');

    expect(screen.getByText('Result unavailable')).toBeOnTheScreen();
  });

  it('refuses to render a result for another attempt', () => {
    renderScreen('foundations-1', 'other-attempt');

    expect(screen.getByText('Result unavailable')).toBeOnTheScreen();
  });
});
