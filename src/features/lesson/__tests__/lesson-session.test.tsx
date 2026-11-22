import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import type { OfflineLesson } from '@/api/contracts';
import { mockPack } from '@/content/fixtures/pack';
import { useProgressStore } from '@/stores/progressStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { FeedbackSheet } from '../components/FeedbackSheet';
import { HeartsOutModal } from '../components/HeartsOutModal';
import { useLessonSession } from '../useLessonSession';

jest.mock('@/content/ContentProvider', () => ({
  useContent: () => mockRepository,
}));

jest.mock('@/offline/SyncProvider', () => ({
  useSync: () => mockSync,
}));

const mockRepository = {
  getLesson: jest.fn(),
};

const mockSync = {
  enqueue: jest.fn(
    async (_item: { clientAttemptId: string; lessonId: string }) => undefined,
  ),
  flush: jest.fn(async () => ({
    state: 'idle' as const,
    pending: 0,
    lastSyncedAt: null,
  })),
};

const foundations = mockPack.lessons.find(
  (lesson) => lesson.id === 'foundations-1',
) as OfflineLesson;

const soloLesson: OfflineLesson = {
  id: 'solo',
  moduleId: 'foundations',
  title: 'Solo lesson',
  description: 'One question',
  order: 1,
  kind: 'lesson',
  xpReward: 20,
  estimatedMinutes: 1,
  status: 'available',
  exercises: [
    {
      id: 'solo-e1',
      type: 'true_false',
      prompt: 'Solo prompt',
      statement: 'Solo statement',
    },
  ],
  answerKey: {
    'solo-e1': { type: 'true_false', value: true },
  },
};

function Harness() {
  const value = useLessonSession('foundations-1');

  return (
    <View>
      <Text testID="phase">{value.session?.phase ?? 'loading'}</Text>
      <Text testID="index">{String(value.session?.index ?? -1)}</Text>
      <Text testID="answer">
        {value.currentAnswer ? JSON.stringify(value.currentAnswer) : 'none'}
      </Text>
      <Pressable
        testID="pick-a"
        onPress={() => value.answer({ type: 'multiple_choice', optionId: 'a' })}
      />
      <Pressable
        testID="pick-c"
        onPress={() => value.answer({ type: 'multiple_choice', optionId: 'c' })}
      />
      <Pressable
        testID="pick-true"
        onPress={() => value.answer({ type: 'true_false', value: true })}
      />
      <Pressable testID="check" onPress={() => value.check()} />
      <Pressable testID="next" onPress={() => value.next()} />
      <Pressable
        testID="finish"
        onPress={() => {
          void value.finish();
        }}
      />
    </View>
  );
}

async function waitForQuestion() {
  await waitFor(() =>
    expect(screen.getByTestId('phase').props.children).toBe('question'),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRepository.getLesson.mockResolvedValue(foundations);
  useProgressStore.setState({
    userId: 'user-1',
    lessons: {},
    pendingXp: 0,
    pendingXpByAttempt: {},
    lastResult: null,
  });
});

describe('useLessonSession', () => {
  it('restores the answer after unmount and remount', async () => {
    const first = render(<Harness />);

    await waitForQuestion();
    fireEvent.press(screen.getByTestId('pick-a'));

    expect(screen.getByTestId('answer').props.children).toBe(
      JSON.stringify({ type: 'multiple_choice', optionId: 'a' }),
    );

    first.unmount();

    render(<Harness />);
    await waitForQuestion();

    expect(screen.getByTestId('answer').props.children).toBe(
      JSON.stringify({ type: 'multiple_choice', optionId: 'a' }),
    );
  });

  it('resumes at the same question index', async () => {
    const first = render(<Harness />);

    await waitForQuestion();
    fireEvent.press(screen.getByTestId('pick-c'));
    fireEvent.press(screen.getByTestId('check'));
    fireEvent.press(screen.getByTestId('next'));

    await waitFor(() =>
      expect(screen.getByTestId('index').props.children).toBe('1'),
    );

    first.unmount();

    render(<Harness />);
    await waitForQuestion();

    expect(screen.getByTestId('index').props.children).toBe('1');
  });

  it('scores and enqueues the attempt exactly once', async () => {
    mockRepository.getLesson.mockResolvedValue(soloLesson);

    render(<Harness />);
    await waitForQuestion();

    fireEvent.press(screen.getByTestId('pick-true'));
    fireEvent.press(screen.getByTestId('check'));
    fireEvent.press(screen.getByTestId('next'));

    await waitFor(() =>
      expect(screen.getByTestId('phase').props.children).toBe('complete'),
    );

    fireEvent.press(screen.getByTestId('finish'));

    await waitFor(() => expect(mockSync.enqueue).toHaveBeenCalled());

    expect(mockSync.enqueue).toHaveBeenCalledTimes(1);
    expect(mockSync.enqueue.mock.calls[0][0]).toMatchObject({
      clientAttemptId: 'test-uuid',
      lessonId: 'solo',
    });
    expect(useProgressStore.getState().lastResult).toMatchObject({
      clientAttemptId: 'test-uuid',
      lessonId: 'solo',
      score: 1,
      xpEarned: 20,
    });
  });
});

describe('FeedbackSheet', () => {
  it('shows the explanation and continues', () => {
    const onContinue = jest.fn();

    render(
      <ThemeProvider>
        <FeedbackSheet
          visible
          correct={false}
          explanation="The key proves you may move what is there."
          correctAnswerLabel="True"
          onContinue={onContinue}
        />
      </ThemeProvider>,
    );

    expect(
      screen.getByText('The key proves you may move what is there.'),
    ).toBeOnTheScreen();
    expect(screen.getByText('Correct answer: True')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('feedback-continue'));

    expect(onContinue).toHaveBeenCalled();
  });
});

describe('HeartsOutModal', () => {
  it('calls refill and leave', () => {
    const onRefill = jest.fn();
    const onLeave = jest.fn();

    render(
      <ThemeProvider>
        <HeartsOutModal visible onRefill={onRefill} onLeave={onLeave} />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByTestId('refill-hearts'));

    expect(onRefill).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('leave-hearts-out'));

    expect(onLeave).toHaveBeenCalled();
  });
});
