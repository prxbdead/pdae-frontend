import * as z from '@/api/schema';

import {
  offlinePackSchema,
  type ApiClient,
  type LearningModule,
  type LessonSummary,
  type OfflineLesson,
  type OfflinePack,
} from '@/api/contracts';
import { ApiError } from '@/api/errors';
import {
  readJson,
  STORAGE_KEYS,
  writeJson,
  type KeyValueStorage,
} from '@/offline/storage';

type ContentApi = Pick<ApiClient['content'], 'getOfflinePack'>;

function toSummary(lesson: OfflineLesson): LessonSummary {
  return {
    id: lesson.id,
    moduleId: lesson.moduleId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    kind: lesson.kind,
    xpReward: lesson.xpReward,
    estimatedMinutes: lesson.estimatedMinutes,
    status: lesson.status,
    ...(lesson.bestScore === undefined
      ? {}
      : { bestScore: lesson.bestScore }),
  };
}

/**
 * Local-first content access. Cached packs are validated before use, and a
 * corrupt cache falls back to the bundled pack rather than breaking the path.
 */
export class ContentRepository {
  private readonly synthetic = new Map<string, OfflineLesson>();

  constructor(
    private readonly storage: KeyValueStorage,
    private readonly bundled: OfflinePack,
    private readonly api?: ContentApi,
  ) {}

  async getPack(): Promise<OfflinePack> {
    const cached = await readJson<unknown>(
      this.storage,
      STORAGE_KEYS.contentPack,
    );

    if (cached) {
      const parsed = z.safeParse(offlinePackSchema, cached);

      if (parsed.success) {
        return parsed.data;
      }
    }

    return this.bundled;
  }

  async refresh(): Promise<OfflinePack> {
    const current = await this.getPack();

    if (!this.api) {
      return current;
    }

    const next = z.parse(
      offlinePackSchema,
      await this.api.getOfflinePack(current.version),
    );

    if (next.version !== current.version) {
      await writeJson(this.storage, STORAGE_KEYS.contentPack, next);
    }

    return next;
  }

  async getModules(): Promise<LearningModule[]> {
    const pack = await this.getPack();

    return [...pack.modules].sort((a, b) => a.order - b.order);
  }

  async getLessonSummaries(moduleId: string): Promise<LessonSummary[]> {
    const pack = await this.getPack();

    return pack.lessons
      .filter((lesson) => lesson.moduleId === moduleId)
      .sort((a, b) => a.order - b.order)
      .map(toSummary);
  }

  async getLesson(lessonId: string): Promise<OfflineLesson> {
    const synthetic = this.synthetic.get(lessonId);

    if (synthetic) {
      return synthetic;
    }

    const pack = await this.getPack();
    const lesson = pack.lessons.find((entry) => entry.id === lessonId);

    if (!lesson) {
      throw new ApiError('Lesson not found', 404, { code: 'not_found' });
    }

    return lesson;
  }

  /** Practice sessions register temporary lessons that are never persisted. */
  registerSynthetic(lesson: OfflineLesson): void {
    this.synthetic.set(lesson.id, lesson);
  }
}
