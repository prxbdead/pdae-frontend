import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { Answer, Exercise } from '@/api/contracts';
import { useSession } from '@/auth/useSession';
import {
  Button,
  EmptyState,
  Sheet,
  Skeleton,
} from '@/components/ui';
import { describeAnswer } from '@/features/lesson/checkAnswer';
import { ExerciseRenderer } from '@/features/lesson/components/ExerciseRenderer';
import { FeedbackSheet } from '@/features/lesson/components/FeedbackSheet';
import {
  HEART_REFILL_GEM_COST,
  HeartsOutModal,
} from '@/features/lesson/components/HeartsOutModal';
import { QuestionHeader } from '@/features/lesson/components/QuestionHeader';
import { useLessonSession } from '@/features/lesson/useLessonSession';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSafeInsets } from '@/theme/useSafeInsets';
import { useTheme } from '@/theme/useTheme';

function optionAnswer(exercise: Exercise, optionId: string): Answer | null {
  switch (exercise.type) {
    case 'multiple_choice':
      return { type: 'multiple_choice', optionId };
    case 'read_chart':
      return { type: 'read_chart', optionId };
    case 'story_card':
      return { type: 'story_card', optionId };
    default:
      return null;
  }
}

export default function LessonPlayScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeInsets();
  const { user, updateUser } = useSession();
  const {
    session,
    lesson,
    currentExercise,
    currentAnswer,
    isReady,
    isLoading,
    error,
    answer,
    check,
    next,
    refill,
    finish,
    retry,
  } = useLessonSession(lessonId);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const finishing = useRef(false);

  const spendGems = () => {
    if (!user || user.gems < HEART_REFILL_GEM_COST) {
      return;
    }

    // The backend does not expose a heart-refill endpoint yet, so the purchase
    // is applied to the cached profile immediately; the next server profile
    // refresh remains authoritative.
    updateUser({
      ...user,
      gems: user.gems - HEART_REFILL_GEM_COST,
      hearts: user.maxHearts,
    });
    refill();
  };

  useEffect(() => {
    if (
      !session ||
      session.phase !== 'complete' ||
      !lesson ||
      finishing.current
    ) {
      return;
    }

    finishing.current = true;

    void (async () => {
      const result = await finish();
      const query = result
        ? `?attemptId=${encodeURIComponent(result.clientAttemptId)}`
        : '';

      router.replace(`/lesson/${lesson.id}/result${query}`);
    })();
  }, [session, lesson, finish, router]);

  const shortcuts = useMemo(() => {
    const map: Record<string, () => void> = {};

    if (!session) {
      return map;
    }

    if (session.phase === 'feedback') {
      map.Enter = next;

      return map;
    }

    if (session.phase !== 'question' || !currentExercise) {
      return map;
    }

    const options =
      currentExercise.type === 'multiple_choice' ||
      currentExercise.type === 'read_chart' ||
      currentExercise.type === 'story_card'
        ? currentExercise.options
        : currentExercise.type === 'true_false'
          ? [
              { id: 'true', text: 'True' },
              { id: 'false', text: 'False' },
            ]
          : [];

    options.forEach((option, index) => {
      if (index > 8) {
        return;
      }

      map[String(index + 1)] = () => {
        if (currentExercise.type === 'true_false') {
          answer({ type: 'true_false', value: option.id === 'true' });

          return;
        }

        const value = optionAnswer(currentExercise, option.id);

        if (value) {
          answer(value);
        }
      };
    });

    map.Enter = () => {
      if (isReady) {
        check();
      }
    };

    return map;
  }, [session, currentExercise, answer, check, next, isReady]);

  useKeyboardShortcuts(shortcuts, session?.phase === 'question' || session?.phase === 'feedback');

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View
          style={[
            styles.content,
            { maxWidth: theme.breakpoints.lessonWidth },
          ]}
        >
          <View style={styles.loading}>
            <Skeleton height={12} />
            <Skeleton height={28} width="80%" />
            <Skeleton height={56} />
            <Skeleton height={56} />
            <Skeleton height={56} />
          </View>
        </View>
      </View>
    );
  }

  if (error || !lesson || !session || !currentExercise) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="book"
          title="Couldn't open this lesson"
          message="Your downloaded lessons could not be read from this device."
          actionLabel="Retry"
          onAction={retry}
        />
      </View>
    );
  }

  const currentId = session.queue[session.index] ?? null;
  const result = currentId ? session.results[currentId] : undefined;
  const feedbackVisible = session.phase === 'feedback';
  const progress =
    session.exerciseIds.length === 0
      ? 0
      : Object.keys(session.results).length / session.exerciseIds.length;
  const correctAnswerLabel =
    currentId && result && !result.correct
      ? describeAnswer(currentExercise, lesson.answerKey[currentId])
      : undefined;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.content,
          {
            maxWidth: theme.breakpoints.lessonWidth,
            paddingTop: theme.spacing.md + insets.top,
          },
        ]}
      >
        <QuestionHeader
          progress={progress}
          hearts={session.hearts}
          onClose={() => setLeaveOpen(true)}
        />

        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            accessibilityRole="header"
            style={[theme.typography.heading, { color: theme.colors.text }]}
          >
            {currentExercise.prompt}
          </Text>

          {currentExercise.type === 'true_false' ? (
            <Text
              style={[
                theme.typography.body,
                { color: theme.colors.textMuted },
              ]}
            >
              {currentExercise.statement}
            </Text>
          ) : null}

          <ExerciseRenderer
            exercise={currentExercise}
            answer={currentAnswer}
            onChange={answer}
            disabled={session.phase !== 'question'}
          />
        </ScrollView>

        {session.phase === 'question' ? (
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom },
            ]}
          >
            <Button
              label="Check"
              onPress={() => check()}
              disabled={!isReady}
              size="lg"
              fullWidth
              testID="lesson-check"
            />
          </View>
        ) : null}
      </View>

      <FeedbackSheet
        visible={feedbackVisible}
        correct={result?.correct ?? false}
        explanation={currentExercise.explanation}
        correctAnswerLabel={correctAnswerLabel}
        onContinue={next}
      />

      <HeartsOutModal
        visible={session.phase === 'hearts_out'}
        gems={user?.gems ?? 0}
        onRefill={refill}
        onSpendGems={spendGems}
        onWait={() => router.dismissTo('/(tabs)/learn')}
        onLeave={() => router.dismissTo(`/lesson/${lessonId}`)}
      />

      <Sheet
        visible={leaveOpen}
        title="Leave lesson?"
        onClose={() => setLeaveOpen(false)}
      >
        <Text
          style={[theme.typography.body, { color: theme.colors.textMuted }]}
        >
          Your progress is saved. You can pick this lesson up where you left
          off.
        </Text>
        <Button
          label="Stay"
          onPress={() => setLeaveOpen(false)}
          fullWidth
          testID="stay-lesson"
        />
        <Button
          label="Leave"
          onPress={() => {
            setLeaveOpen(false);
            router.dismissTo(`/lesson/${lessonId}`);
          }}
          variant="contrast"
          fullWidth
          testID="leave-lesson"
        />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    flex: 1,
    gap: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
  },
  loading: {
    gap: 16,
  },
  body: {
    gap: 16,
    paddingBottom: 24,
  },
  footer: {
    paddingTop: 8,
  },
});
