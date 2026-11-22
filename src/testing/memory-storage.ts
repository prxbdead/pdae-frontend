import type { KeyValueStorage } from '@/offline/storage';

export class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.values.delete(key);
  }

  clearAll(): void {
    this.values.clear();
  }

  has(key: string): boolean {
    return this.values.has(key);
  }
}
