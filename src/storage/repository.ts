import { decodeProgress, initialProgress, Progress } from '../domain/progress';

export const STORAGE_KEY = '@anxietics/progress/v1';
export type LocalStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export function createProgressRepository(storage: LocalStorage) {
  let pending = Promise.resolve();
  return {
    async load(now = new Date()): Promise<Progress> {
      const raw = await storage.getItem(STORAGE_KEY);
      return raw === null ? initialProgress(now) : decodeProgress(raw, now);
    },
    save(progress: Progress): Promise<void> {
      const snapshot = JSON.stringify(progress);
      // Uma escrita antiga nunca pode terminar por cima de uma mais nova.
      const writing = pending
        .catch(() => undefined)
        .then(() => storage.setItem(STORAGE_KEY, snapshot));
      pending = writing;
      return writing;
    },
  };
}
