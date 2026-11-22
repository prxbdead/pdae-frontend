import { STORAGE_KEYS } from '@/offline/storage';
import { MemoryStorage } from '@/testing/memory-storage';

import { mockPack } from '../fixtures/pack';
import { ContentRepository } from '../repository';

function buildPack(version: string) {
  return { ...mockPack, version };
}

function buildRepository(options?: { newerVersion?: string }) {
  const storage = new MemoryStorage();
  const getOfflinePack = jest
    .fn()
    .mockResolvedValue(
      buildPack(options?.newerVersion ?? '2.0.0'),
    );
  const api = { getOfflinePack };
  const repository = new ContentRepository(storage, mockPack, api);

  return { storage, getOfflinePack, repository };
}

describe('ContentRepository', () => {
  it('serves the bundled pack when nothing is cached', async () => {
    const { repository } = buildRepository();

    const pack = await repository.getPack();

    expect(pack.version).toBe(mockPack.version);
    expect(pack.modules).toHaveLength(5);
  });

  it('saves a newer pack on refresh', async () => {
    const { repository, storage } = buildRepository({ newerVersion: '2.0.0' });

    const refreshed = await repository.refresh();

    expect(refreshed.version).toBe('2.0.0');
    expect(await storage.getItem(STORAGE_KEYS.contentPack)).toContain(
      '2.0.0',
    );
    expect((await repository.getPack()).version).toBe('2.0.0');
  });

  it('falls back to the bundled pack when the cache is corrupt', async () => {
    const { repository, storage } = buildRepository();

    await storage.setItem(STORAGE_KEYS.contentPack, '{not json');

    expect((await repository.getPack()).version).toBe(mockPack.version);
  });

  it('falls back when the cached pack is valid JSON but the wrong shape', async () => {
    const { repository, storage } = buildRepository();

    await storage.setItem(STORAGE_KEYS.contentPack, JSON.stringify({ v: 1 }));

    expect((await repository.getPack()).version).toBe(mockPack.version);
  });

  it('sorts modules and lesson summaries', async () => {
    const { repository } = buildRepository();

    const modules = await repository.getModules();
    const lessons = await repository.getLessonSummaries('foundations');

    expect(modules.map((module) => module.order)).toEqual([1, 2, 3, 4, 5]);
    expect(lessons.map((lesson) => lesson.order)).toEqual([1, 2]);
  });

  it('returns lessons with their answer keys', async () => {
    const { repository } = buildRepository();

    const lesson = await repository.getLesson('foundations-1');

    expect(lesson.answerKey['foundations-1-e1']).toBeDefined();
  });

  it('prefers a registered synthetic lesson', async () => {
    const { repository } = buildRepository();
    const synthetic = {
      ...mockPack.lessons[0],
      id: 'practice-mistakes-1',
      title: 'Mistake review',
    };

    repository.registerSynthetic(synthetic);

    expect((await repository.getLesson('practice-mistakes-1')).title).toBe(
      'Mistake review',
    );
  });
});
