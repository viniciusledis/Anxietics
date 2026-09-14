import assert from 'node:assert/strict';
import { test } from 'node:test';
import { completeStage, initialProgress } from '../src/domain/progress';
import { createProgressRepository, LocalStorage } from '../src/storage/repository';
import { getStageStatus } from '../src/trail/stages';

const day = new Date(2026, 8, 14, 12);

function memoryStorage(): LocalStorage {
  const data = new Map<string, string>();
  return { async getItem(key) { return data.get(key) ?? null; }, async setItem(key, value) { data.set(key, value); } };
}

test('repositório novo recupera desbloqueio e preferências após salvar', async () => {
  const disk = memoryStorage();
  const firstSession = createProgressRepository(disk);
  let progress = await firstSession.load(day);
  progress = completeStage(progress, 'jardim', day);
  progress.preferences.reducedMotion = true;
  await firstSession.save(progress);
  const nextSession = createProgressRepository(disk);
  const restored = await nextSession.load(day);
  assert.deepEqual(restored, progress);
  assert.equal(getStageStatus('clareira', restored.completedStageIds), 'available');
});

test('fila preserva ordem quando a primeira escrita é lenta', async () => {
  const disk = memoryStorage();
  const history: string[] = [];
  let release!: () => void;
  let started!: () => void;
  const began = new Promise<void>(resolve => { started = resolve; });
  const held = new Promise<void>(resolve => { release = resolve; });
  const repository = createProgressRepository({
    getItem: disk.getItem,
    async setItem(key, value) {
      history.push(value);
      if (history.length === 1) { started(); await held; }
      await disk.setItem(key, value);
    },
  });
  const first = completeStage(initialProgress(day), 'jardim', day);
  const second = completeStage(first, 'clareira', day);
  const writingFirst = repository.save(first);
  const writingSecond = repository.save(second);
  await began;
  assert.equal(history.length, 1);
  release();
  await Promise.all([writingFirst, writingSecond]);
  assert.equal(history.length, 2);
  assert.deepEqual(await repository.load(day), second);
});

test('erro de escrita é informado e não impede uma nova tentativa', async () => {
  const disk = memoryStorage();
  let fail = true;
  const repository = createProgressRepository({
    getItem: disk.getItem,
    async setItem(key, value) {
      if (fail) { fail = false; throw new Error('sem espaço'); }
      return disk.setItem(key, value);
    },
  });
  const progress = completeStage(initialProgress(day), 'jardim', day);
  await assert.rejects(repository.save(progress), /sem espaço/);
  await repository.save(progress);
  assert.deepEqual(await repository.load(day), progress);
});

test('falha de leitura e JSON corrompido não sobrescrevem os dados', async () => {
  let writes = 0;
  for (const brokenRead of [async () => '{', async () => { throw new Error('indisponível'); }]) {
    const repository = createProgressRepository({ getItem: brokenRead, async setItem() { writes++; } });
    await assert.rejects(repository.load(day));
  }
  assert.equal(writes, 0);
});
