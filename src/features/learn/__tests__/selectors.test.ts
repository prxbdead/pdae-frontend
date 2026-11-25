import type {
  LessonSummary,
  OfflineLesson,
  OfflinePack,
} from '@/api/contracts';
import { mockPack } from '@/content/fixtures/pack';
import type { LocalLessonProgress } from '@/offline/types';

import {
  selectLearnPath,
  selectNextLesson,
  selectUnitProgress,
  selectUnitLessons,
} from '../selectors';

function completed(id: string): LocalLessonProgress {
  return { lessonId: id, status: 'completed', attempts: 1 };
}

function allLessonsCompleted(): Record<string, LocalLessonProgress> {
  return Object.fromEntries(
    mockPack.lessons
      .filter((lesson) => lesson.kind === 'lesson')
      .map((lesson) => [lesson.id, completed(lesson.id)]),
  );
}

describe('selectLearnPath', () => {
  it('starts a fresh learner on the first lesson of unit 1', () => {
    const path = selectLearnPath(mockPack, {});

    expect(path.nextLesson?.id).toBe('foundations-1');
    expect(path.currentUnit?.id).toBe('foundations');
    expect(path.units[0].lessons[0].status).toBe('available');
    expect(path.units[0].lessons[1].status).toBe('locked');
  });

  it('moves to the second lesson once the first is complete', () => {
    const path = selectLearnPath(mockPack, {
      'foundations-1': completed('foundations-1'),
    });

    expect(path.nextLesson?.id).toBe('foundations-2');
    expect(path.units[0].lessons[0].status).toBe('completed');
    expect(path.units[0].lessons[1].status).toBe('available');
  });

  it('moves to the next unit when the current one is finished', () => {
    const path = selectLearnPath(mockPack, {
      'foundations-1': completed('foundations-1'),
      'foundations-2': completed('foundations-2'),
    });

    expect(path.nextLesson?.id).toBe('price-action-1');
    expect(path.currentUnit?.id).toBe('price-action');
  });

  it('keeps later lessons locked while an earlier one is incomplete', () => {
    const lessons = selectUnitLessons(mockPack, 'foundations', {});

    expect(lessons.every((lesson) => lesson.status !== 'completed')).toBe(
      true,
    );
    expect(lessons[1].status).toBe('locked');
  });

  it('keeps a server-completed lesson completed without local progress', () => {
    const pack: OfflinePack = {
      ...mockPack,
      lessons: mockPack.lessons.map((lesson) =>
        lesson.id === 'foundations-1'
          ? { ...lesson, status: 'completed' as const }
          : lesson,
      ),
    };

    const lessons = selectUnitLessons(pack, 'foundations', {});

    expect(lessons[0].status).toBe('completed');
    expect(lessons[1].status).toBe('available');
    expect(selectNextLesson(pack, {})?.id).toBe('foundations-2');
  });

  it('prefers local progress over the pack snapshot', () => {
    const path = selectLearnPath(mockPack, {
      'foundations-1': {
        lessonId: 'foundations-1',
        status: 'in_progress',
        attempts: 1,
        bestScore: 0.5,
      },
    });

    expect(path.nextLesson?.id).toBe('foundations-1');
    expect(path.units[0].lessons[0].status).toBe('in_progress');
  });

  it('returns null when every lesson is complete', () => {
    const progress = allLessonsCompleted();

    expect(selectNextLesson(mockPack, progress)).toBeNull();
    expect(selectLearnPath(mockPack, progress).nextLesson).toBeNull();
    expect(selectLearnPath(mockPack, progress).currentUnit?.id).toBe('safety');
  });
});

describe('selectUnitProgress', () => {
  it('counts lessons only, never chests', () => {
    const chest: LessonSummary = {
      ...mockPack.lessons[0],
      id: 'chest-1',
      kind: 'chest',
      status: 'locked',
    };

    const progress = {
      'chest-1': completed('chest-1'),
      [mockPack.lessons[0].id]: completed(mockPack.lessons[0].id),
    };

    expect(selectUnitProgress([chest, mockPack.lessons[0]], progress)).toEqual(
      { completed: 1, total: 1 },
    );
  });
});

describe('selectUnitLessons with a chest in the pack', () => {
  it('does not let a chest break the unlock chain', () => {
    const chest: OfflineLesson = {
      ...mockPack.lessons[0],
      id: 'chest-1',
      kind: 'chest',
      order: 1,
      status: 'locked',
    };
    const second: OfflineLesson = {
      ...mockPack.lessons[1],
      order: 2,
    };
    const pack: OfflinePack = {
      ...mockPack,
      modules: mockPack.modules.map((module) =>
        module.id === 'foundations'
          ? { ...module, lessonCount: 2 }
          : module,
      ),
      lessons: [
        { ...mockPack.lessons[0], order: 0 },
        chest,
        second,
      ],
    };

    const lessons = selectUnitLessons(pack, 'foundations', {
      [mockPack.lessons[0].id]: completed(mockPack.lessons[0].id),
    });

    expect(lessons[1].status).toBe('locked');
    expect(lessons[2].status).toBe('available');
  });
});
