import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Answer, Exercise, OfflineLesson } from '@/api/contracts';
import { useContent } from '@/content/ContentProvider';
import { useSync } from '@/offline/SyncProvider';
import {
  createAsyncStorageKeyValue,
  readJson,
  STORAGE_KEYS,
  writeJson,
} from '@/offline/storage';
import type { LocalAttemptResult } from '@/offline/types';
import { feedback } from '@/services/feedback';
import { useProgressStore } from '@/stores/progressStore';

import { checkAnswer, isAnswerReady } from './checkAnswer';
import { createLessonSession, lessonReducer, scoreAttempt } from './engine';
import type { LessonAction, LessonSession } from './types';

function isRestorable(
  session: LessonSession | null,
  lessonId: string,
): session is LessonSession {
  return (
    session !== null &&
    session.lessonId === lessonId &&
    session.phase !== 'complete' &&
    Array.isArray(session.queue) &&
    Array.isArray(session.exerciseIds) &&
    session.exerciseIds.length > 0 &&
    typeof session.answers === 'object' &&
    typeof session.attempts === 'object' &&
    typeof session.results === 'object'
  );
}

export interface LessonSessionValue {
  session: LessonSession | null;
  lesson: OfflineLesson | null;
  currentExercise: Exercise | null;
  currentAnswer: Answer | undefined;
  isReady: boolean;
  isLoading: boolean;
  error: boolean;
  answer(value: Answer): void;
  check(): boolean | null;
  next(): void;
  refill(): void;
  finish(): Promise<LocalAttemptResult | null>;
  retry(): void;
}

/**
 * Owns one playable lesson: loads it, restores a persisted in-progress
 * session, and applies each reducer step. The session is persisted after every
 * change under `hodlo:v1:lesson-session`, so a refresh or app restart resumes
 * on the same question with the same answers.
 */
export function useLessonSession(lessonId: string): LessonSessionValue {
  const repository = useContent();
  const applyLocalResult = useProgressStore(
    (state) => state.applyLocalResult,
  );
  const { enqueue, flush } = useSync();
  const storage = useMemo(() => createAsyncStorageKeyValue(), []);
  const [lesson, setLesson] = useState<OfflineLesson | null>(null);
  const [session, setSession] = useState<LessonSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const loaded = await repository.getLesson(lessonId);
        const stored = await readJson<LessonSession>(
          storage,
          STORAGE_KEYS.lessonSession,
        );

        if (!active) {
          return;
        }

        setLesson(loaded);
        setSession(
          isRestorable(stored, loaded.id)
            ? stored
            : createLessonSession(loaded),
        );
      } catch {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [repository, lessonId, storage, reloadToken]);

  useEffect(() => {
    if (!session) {
      return;
    }

    if (session.phase === 'complete') {
      void storage.removeItem(STORAGE_KEYS.lessonSession);

      return;
    }

    void writeJson(storage, STORAGE_KEYS.lessonSession, session);
  }, [session, storage]);

  const dispatch = useCallback((action: LessonAction) => {
    setSession((current) =>
      current ? lessonReducer(current, action) : current,
    );
  }, []);

  const currentExerciseId = session?.queue[session.index] ?? null;
  const currentExercise =
    lesson?.exercises.find((exercise) => exercise.id === currentExerciseId) ??
    null;
  const currentAnswer =
    currentExerciseId && session ? session.answers[currentExerciseId] : undefined;

  const answer = useCallback(
    (value: Answer) => {
      if (!currentExerciseId) {
        return;
      }

      dispatch({
        type: 'answer',
        exerciseId: currentExerciseId,
        answer: value,
      });
    },
    [currentExerciseId, dispatch],
  );

  const check = useCallback((): boolean | null => {
    if (!lesson || !session || !currentExercise || !currentExerciseId) {
      return null;
    }

    const submitted = session.answers[currentExerciseId];

    if (!submitted) {
      return null;
    }

    const result = checkAnswer(currentExercise, submitted, lesson.answerKey);

    dispatch({
      type: 'check',
      exerciseId: currentExerciseId,
      correct: result.correct,
    });

    if (result.correct) {
      feedback.correct();
    } else {
      feedback.wrong();
    }

    return result.correct;
  }, [lesson, session, currentExercise, currentExerciseId, dispatch]);

  const next = useCallback(() => dispatch({ type: 'continue' }), [dispatch]);
  const refill = useCallback(() => dispatch({ type: 'refill' }), [dispatch]);

  const finish = useCallback(async (): Promise<LocalAttemptResult | null> => {
    if (!lesson || !session) {
      return null;
    }

    const result = scoreAttempt(lesson, session);

    await applyLocalResult(result);
    await enqueue({
      clientAttemptId: result.clientAttemptId,
      lessonId: result.lessonId,
      localResult: result,
      retries: 0,
    });
    void flush();
    await storage.removeItem(STORAGE_KEYS.lessonSession);

    return result;
  }, [lesson, session, applyLocalResult, enqueue, flush, storage]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(false);
    setReloadToken((token) => token + 1);
  }, []);
  const isReady =
    currentExercise !== null && isAnswerReady(currentExercise, currentAnswer);

  return {
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
  };
}
