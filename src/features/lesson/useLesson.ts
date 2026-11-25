import { useCallback, useEffect, useState } from 'react';

import type { LearningModule, OfflineLesson } from '@/api/contracts';
import { useContent } from '@/content/ContentProvider';

export interface LessonDetail {
  lesson: OfflineLesson | null;
  module: LearningModule | null;
  isLoading: boolean;
  error: boolean;
  retry(): void;
}

/** Loads a lesson intro's lesson plus its owning module (for the teacher). */
export function useLesson(lessonId: string): LessonDetail {
  const repository = useContent();
  const [lesson, setLesson] = useState<OfflineLesson | null>(null);
  const [module, setModule] = useState<LearningModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const [loaded, pack] = await Promise.all([
          repository.getLesson(lessonId),
          repository.getPack(),
        ]);

        if (!active) {
          return;
        }

        setLesson(loaded);
        setModule(
          pack.modules.find((entry) => entry.id === loaded.moduleId) ?? null,
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
  }, [repository, lessonId, reloadToken]);

  const retry = useCallback(() => {
    setIsLoading(true);
    setError(false);
    setReloadToken((token) => token + 1);
  }, []);

  return { lesson, module, isLoading, error, retry };
}
