import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  AnswerKey,
  Exercise,
  LearningModule,
  OfflineLesson,
  OfflinePack,
} from '@/api/contracts';
import type { IconName } from '@/assets/icons';
import { useContent } from '@/content/ContentProvider';
import { useProgressStore } from '@/stores/progressStore';

export type PracticeKind =
  | 'mistakes'
  | 'chart'
  | 'scam'
  | 'risk'
  | 'dca'
  | 'trading'
  | 'flashcards';

export type PracticeTone = 'purple' | 'mint' | 'coral' | 'yellow' | 'lilac';

export interface PracticeItem {
  kind: PracticeKind;
  title: string;
  description: string;
  icon: IconName;
  href: string;
  badge?: string;
  tone: PracticeTone;
  disabled?: boolean;
}

export const MISTAKES_LESSON_ID = 'practice-mistakes';

type DrillKind = 'chart' | 'scam' | 'risk' | 'dca';

const DRILLS: Record<
  DrillKind,
  { moduleId: LearningModule['id']; type: Exercise['type']; teacher: string }
> = {
  chart: { moduleId: 'price-action', type: 'read_chart', teacher: 'Chip' },
  scam: { moduleId: 'safety', type: 'spot_scam', teacher: 'Vex' },
  risk: { moduleId: 'risk', type: 'risk_calculator', teacher: 'Grizz' },
  dca: { moduleId: 'investing', type: 'dca_timeline', teacher: 'Tank' },
};

/** First lesson in the teacher's unit that contains the drill's exercise. */
export function selectPracticeLesson(
  pack: OfflinePack,
  kind: DrillKind,
): OfflineLesson | null {
  const drill = DRILLS[kind];
  const lessons = pack.lessons
    .filter((lesson) => lesson.moduleId === drill.moduleId)
    .sort((a, b) => a.order - b.order);

  return (
    lessons.find((lesson) =>
      lesson.exercises.some((exercise) => exercise.type === drill.type),
    ) ?? null
  );
}

/**
 * A throwaway lesson containing only the missed exercises, in the original
 * pack order, with each answer copied from its source lesson.
 */
export function buildMistakesLesson(
  pack: OfflinePack,
  mistakeIds: string[],
): OfflineLesson | null {
  const wanted = new Set(mistakeIds);
  const exercises: Exercise[] = [];
  const answerKey: AnswerKey = {};
  let moduleId = 'foundations';

  for (const lesson of [...pack.lessons].sort((a, b) => a.order - b.order)) {
    for (const exercise of lesson.exercises) {
      if (!wanted.has(exercise.id)) {
        continue;
      }

      const answer = lesson.answerKey[exercise.id];

      if (answer === undefined) {
        continue;
      }

      if (exercises.length === 0) {
        moduleId = lesson.moduleId;
      }

      exercises.push(exercise);
      answerKey[exercise.id] = answer;
    }
  }

  if (exercises.length === 0) {
    return null;
  }

  return {
    id: MISTAKES_LESSON_ID,
    moduleId,
    title: 'Mistakes review',
    description: 'A second pass at the questions that caught you.',
    order: 0,
    kind: 'lesson',
    xpReward: 0,
    estimatedMinutes: Math.max(1, Math.ceil(exercises.length * 0.5)),
    status: 'available',
    exercises,
    answerKey,
  };
}

export function buildPracticeItems(
  pack: OfflinePack,
  mistakeIds: string[],
): PracticeItem[] {
  const hrefFor = (kind: DrillKind): Pick<PracticeItem, 'href' | 'disabled'> => {
    const lesson = selectPracticeLesson(pack, kind);

    return lesson
      ? { href: `/lesson/${lesson.id}` }
      : { href: '/practice', disabled: true };
  };

  return [
    {
      kind: 'mistakes',
      title: 'Mistakes review',
      description: 'A second pass at the questions that caught you.',
      icon: 'practice',
      href: '/practice/mistakes',
      badge:
        mistakeIds.length > 0
          ? `${mistakeIds.length} to review`
          : 'No mistakes yet',
      tone: 'mint',
      disabled: mistakeIds.length === 0,
    },
    {
      kind: 'chart',
      title: 'What just happened?',
      description: 'Read the candles, not the shill.',
      icon: 'chart',
      tone: 'purple',
      ...hrefFor('chart'),
    },
    {
      kind: 'scam',
      title: 'Spot the scam',
      description: 'Find the red flags before they find you.',
      icon: 'shield',
      tone: 'coral',
      ...hrefFor('scam'),
    },
    {
      kind: 'risk',
      title: 'Bear case drill',
      description: 'Size the risk before the trade.',
      icon: 'shield',
      tone: 'yellow',
      ...hrefFor('risk'),
    },
    {
      kind: 'dca',
      title: 'Hold the line',
      description: 'Let boring compounding do the work.',
      icon: 'wallet',
      tone: 'lilac',
      ...hrefFor('dca'),
    },
    {
      kind: 'trading',
      title: 'Paper trading',
      description: 'Practice with virtual money.',
      icon: 'chart',
      href: '/practice/trading',
      badge: 'Virtual money',
      tone: 'purple',
    },
    {
      kind: 'flashcards',
      title: 'Flashcards',
      description: 'Quick definitions for shaky terms.',
      icon: 'book',
      href: '/glossary',
      badge: 'Soon',
      tone: 'yellow',
      // The glossary route ships in Task 16; keep the card from dead-ending.
      disabled: true,
    },
  ];
}

export interface PracticeData {
  items: PracticeItem[];
  mistakeCount: number;
  isLoading: boolean;
  error: boolean;
  refresh(): void;
}

export function usePracticeData(): PracticeData {
  const repository = useContent();
  const mistakeIds = useProgressStore((state) => state.mistakeIds ?? []);
  const [pack, setPack] = useState<OfflinePack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const next = await repository.getPack();

        if (active) {
          setPack(next);
        }
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
  }, [repository, reloadToken]);

  const refresh = useCallback(() => {
    setError(false);
    setIsLoading(true);
    setReloadToken((token) => token + 1);
  }, []);

  const items = useMemo(
    () => (pack ? buildPracticeItems(pack, mistakeIds) : []),
    [mistakeIds, pack],
  );

  return {
    items,
    mistakeCount: mistakeIds.length,
    isLoading,
    error,
    refresh,
  };
}
