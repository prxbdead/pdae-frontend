import type {
  LearningModule,
  LessonSummary,
  OfflinePack,
} from '@/api/contracts';
import type { LocalLessonProgress } from '@/offline/types';

export interface UnitSection {
  module: LearningModule;
  lessons: LessonSummary[];
  completed: number;
  total: number;
}

export interface LearnPath {
  units: UnitSection[];
  nextLesson: LessonSummary | null;
  currentUnit: LearningModule | null;
}

function mergeLesson(
  lesson: LessonSummary,
  local: LocalLessonProgress | undefined,
  previousCompleted: boolean,
): { lesson: LessonSummary; completed: boolean } {
  if (local) {
    const status =
      local.status === 'completed' ? 'completed' : 'in_progress';

    return {
      lesson: {
        ...lesson,
        status,
        ...(local.bestScore === undefined
          ? {}
          : { bestScore: local.bestScore }),
      },
      completed: status === 'completed',
    };
  }

  if (lesson.kind !== 'lesson') {
    return { lesson, completed: false };
  }

  return {
    lesson: {
      ...lesson,
      status: previousCompleted ? 'available' : 'locked',
    },
    completed: false,
  };
}

/**
 * Local progress wins over the pack's server snapshot. Locking is derived
 * sequentially inside a module, so a stored "available" can never unlock a
 * lesson whose predecessor is still incomplete.
 */
export function selectUnitLessons(
  pack: OfflinePack,
  moduleId: string,
  progress: Record<string, LocalLessonProgress>,
): LessonSummary[] {
  const lessons = pack.lessons
    .filter((lesson) => lesson.moduleId === moduleId)
    .sort((a, b) => a.order - b.order);

  let previousCompleted = true;

  return lessons.map((lesson) => {
    const merged = mergeLesson(lesson, progress[lesson.id], previousCompleted);

    if (lesson.kind === 'lesson') {
      previousCompleted = merged.completed;
    }

    return merged.lesson;
  });
}

export function selectUnitProgress(
  lessons: LessonSummary[],
  progress: Record<string, LocalLessonProgress>,
): { completed: number; total: number } {
  const counted = lessons.filter((lesson) => lesson.kind === 'lesson');
  const completed = counted.filter((lesson) => {
    const local = progress[lesson.id];

    if (local) {
      return local.status === 'completed';
    }

    return lesson.status === 'completed';
  }).length;

  return { completed, total: counted.length };
}

export function selectNextLesson(
  pack: OfflinePack,
  progress: Record<string, LocalLessonProgress>,
): LessonSummary | null {
  const modules = [...pack.modules].sort((a, b) => a.order - b.order);

  for (const learningModule of modules) {
    const lessons = selectUnitLessons(pack, learningModule.id, progress);
    const candidate = lessons.find(
      (lesson) =>
        lesson.kind === 'lesson' &&
        (lesson.status === 'available' || lesson.status === 'in_progress'),
    );

    if (candidate) {
      return candidate;
    }
  }

  return null;
}

export function selectLearnPath(
  pack: OfflinePack,
  progress: Record<string, LocalLessonProgress>,
): LearnPath {
  const modules = [...pack.modules].sort((a, b) => a.order - b.order);
  const units = modules.map((learningModule) => {
    const lessons = selectUnitLessons(pack, learningModule.id, progress);

    return {
      module: learningModule,
      lessons,
      ...selectUnitProgress(lessons, progress),
    };
  });

  const nextLesson = selectNextLesson(pack, progress);
  const currentUnit = nextLesson
    ? (modules.find((module) => module.id === nextLesson.moduleId) ??
      modules[modules.length - 1] ??
      null)
    : (modules[modules.length - 1] ?? null);

  return { units, nextLesson, currentUnit };
}
