import type { LocalLessonProgress } from './types';
import {
  readJson,
  STORAGE_KEYS,
  writeJson,
  type KeyValueStorage,
} from './storage';

export class ProgressRepository {
  constructor(private readonly storage: KeyValueStorage) {}

  async get(userId: string): Promise<Record<string, LocalLessonProgress>> {
    const stored = await readJson<Record<string, LocalLessonProgress>>(
      this.storage,
      STORAGE_KEYS.progress(userId),
    );

    return stored ?? {};
  }

  async save(
    userId: string,
    progress: Record<string, LocalLessonProgress>,
  ): Promise<void> {
    await writeJson(this.storage, STORAGE_KEYS.progress(userId), progress);
  }

  async clear(userId: string): Promise<void> {
    await this.storage.removeItem(STORAGE_KEYS.progress(userId));
  }
}
