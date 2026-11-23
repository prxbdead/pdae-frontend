import type { StreakState } from '@/api/contracts';

import type { LocalLessonProgress } from './types';
import {
  readJson,
  STORAGE_KEYS,
  writeJson,
  type KeyValueStorage,
} from './storage';

/**
 * Everything persisted for one learner. Only `lessons` is required so a file
 * written by an earlier build (a bare lesson map) still loads.
 */
export interface PersistedProgress {
  lessons: Record<string, LocalLessonProgress>;
  pendingXp?: number;
  pendingXpByAttempt?: Record<string, number>;
  xpToday?: number;
  xpTodayDate?: string;
  dailyGoalXp?: number;
  streak?: StreakState;
  mistakeIds?: string[];
}

export class ProgressRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async get(userId: string): Promise<PersistedProgress | null> {
    const stored = await readJson<unknown>(
      this.storage,
      STORAGE_KEYS.progress(userId),
    );

    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
      return null;
    }

    const record = stored as Record<string, unknown>;

    if (record.lessons && typeof record.lessons === 'object') {
      return stored as PersistedProgress;
    }

    // Legacy shape: the stored object was the lesson map itself.
    return {
      lessons: stored as Record<string, LocalLessonProgress>,
    };
  }

  async save(userId: string, progress: PersistedProgress): Promise<void> {
    await writeJson(this.storage, STORAGE_KEYS.progress(userId), progress);
  }

  async clear(userId: string): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.progress(userId));
  }
}
