import { useCallback, useEffect, useMemo, useState } from 'react';

import type { OfflinePack } from '@/api/contracts';
import { useContent } from '@/content/ContentProvider';
import { useProgressStore } from '@/stores/progressStore';

import { selectLearnPath, type LearnPath } from './selectors';

const emptyPath: LearnPath = {
  units: [],
  nextLesson: null,
  currentUnit: null,
};

export interface LearnPathState extends LearnPath {
  isLoading: boolean;
  error: boolean;
  refresh(): void;
}

export function useLearnPath(): LearnPathState {
  const repository = useContent();
  const progress = useProgressStore((state) => state.lessons);
  const [pack, setPack] = useState<OfflinePack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

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
  }, [repository]);

  const refresh = useCallback(() => {
    setError(false);
    setIsLoading(true);

    void (async () => {
      try {
        const next = await repository.refresh();

        setPack(next);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [repository]);

  const path = useMemo(
    () => (pack ? selectLearnPath(pack, progress) : emptyPath),
    [pack, progress],
  );

  return { ...path, isLoading, error, refresh };
}
