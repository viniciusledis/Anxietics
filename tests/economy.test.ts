import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  completeSession,
  completeStage,
  decodeProgress,
  initialProgress,
  renewDay,
} from '../src/domain/progress';
import {
  buyItem,
  equipItem,
  grassEquipment,
  placeDecoration,
} from '../src/economy/rules';
import { levelFor, ECONOMY } from '../src/economy/config';
import {
  createCoverage,
  cutSegment,
  TOTAL_CELLS,
} from '../src/minigames/grass/coverage';
import {
  createProgressRepository,
  STORAGE_KEY,
} from '../src/storage/repository';
import { createTransactions } from '../src/storage/transactions';
const now = new Date(2026, 8, 14, 12);
function rich() {
  const p = initialProgress(now);
  p.economy.seeds = 1000;
  return p;
}
function daily(
  p: ReturnType<typeof initialProgress>,
  index: number,
  id = `task-${index}`,
) {
  const task = p.daily.tasks[index]!;
  return completeSession(
    p,
    {
      id,
      game: task.game,
      variation: task.variation,
      mode: 'daily',
      taskId: task.id,
      day: p.daily.date,
    },
    now,
  );
}
test('presente único, etapa + diária + primeiro passo discriminados e idempotentes', () => {
  const p = completeStage(initialProgress(now), 'jardim', now);
  assert.equal(p.economy.seeds, 95);
  assert.equal(p.economy.xp, 50);
  assert.deepEqual(
    p.economy.receipts[0]!.lines.map((l) => l.seeds),
    [20, 15, 10],
  );
  assert.equal(p.economy.receipts[0]!.completed.length, 2);
  assert.equal(completeStage(p, 'jardim', now), p);
  const repeat = completeSession(
    p,
    {
      id: 'other',
      mode: 'trail',
      game: 'grass',
      variation: 0,
      stageId: 'jardim',
      day: p.daily.date,
    },
    now,
  );
  assert.equal(repeat.economy.seeds, 95);
  assert.equal(repeat.economy.xp, 50);
  assert.equal(decodeProgress(JSON.stringify(p), now).economy.seeds, 95);
});
test('partida diária também conclui a etapa disponível, incluindo outra variação', () => {
  const p = daily(initialProgress(now), 1);
  assert.deepEqual(p.completedStageIds, ['jardim']);
  assert.equal(p.economy.seeds, 95);
});
test('bônus diário apenas uma vez, inclusive depois de voltar à mesma data', () => {
  let p = initialProgress(now);
  for (let i = 0; i < 3; i++) p = daily(p, i);
  assert.equal(p.economy.seeds, 140);
  assert.equal(p.economy.xp, 90);
  for (let i = 0; i < 3; i++) p = daily(p, i, `repeat-${i}`);
  assert.equal(p.economy.seeds, 140);
  const next = renewDay(p, new Date(2026, 8, 15));
  assert.equal(next.economy, p.economy);
  assert.deepEqual(next.completedStageIds, p.completedStageIds);
  p = renewDay(next, now);
  // Restaura as mesmas tarefas para exercitar IDs já pagos, independentemente do sorteio novo.
  p.daily.tasks = initialProgress(now).daily.tasks;
  for (let i = 0; i < 3; i++) p = daily(p, i, `back-${i}`);
  assert.equal(p.economy.seeds, 140);
});
test('modo livre e laboratório nunca remuneram; ferramenta não multiplica recompensas', () => {
  const p = initialProgress(now);
  assert.equal(
    completeSession(
      p,
      { id: 'free', mode: 'free', game: 'grass', variation: 0 },
      now,
    ),
    p,
  );
  assert.equal(
    completeSession(
      p,
      { id: 'dev', mode: 'dev', game: 'fruit', variation: 0 },
      now,
    ),
    p,
  );
  const equipped = equipItem(
    buyItem(rich(), 'mower-wide').progress,
    'grassTool',
    'mower-wide',
  ).progress;
  const next = completeStage(equipped, 'jardim', now);
  assert.equal(next.economy.seeds - equipped.economy.seeds, 45);
});
test('compra atômica com saldo suficiente, sem saldo e com toques repetidos', () => {
  const p = initialProgress(now);
  const first = buyItem(p, 'mower-blue');
  assert.equal(first.ok, true);
  assert.equal(first.progress.economy.seeds, 20);
  assert.deepEqual(first.progress.economy.ownedItemIds, ['mower-blue']);
  assert.equal(p.economy.seeds, 50);
  const twice = buyItem(first.progress, 'mower-blue');
  assert.equal(twice.progress, first.progress);
  const poor = buyItem(first.progress, 'mower-coral');
  assert.equal(poor.ok, false);
  assert.equal(poor.progress, first.progress);
  assert.match(poor.message, /Saldo insuficiente/);
  assert.equal(buyItem(p, 'unknown').ok, false);
});
test('XP permanente e nível não dependem de saldo ou compra', () => {
  const p = rich();
  p.economy.xp = 235;
  const next = buyItem(p, 'garden-fountain').progress;
  assert.equal(next.economy.xp, 235);
  assert.equal(levelFor(next.economy.xp), 3);
  assert.equal(levelFor(99), 1);
  assert.equal(levelFor(100), 2);
  assert.equal(ECONOMY.xpPerLevel, 100);
});
test('aparência e ferramenta independentes, padrão gratuito e rejeição de incompatíveis', () => {
  let p = buyItem(
    buyItem(rich(), 'mower-blue').progress,
    'mower-wide',
  ).progress;
  p = equipItem(p, 'grassAppearance', 'mower-blue').progress;
  p = equipItem(p, 'grassTool', 'mower-wide').progress;
  assert.equal(grassEquipment(p.economy).width, 1.25);
  assert.equal(grassEquipment(p.economy).color, '#749FB7');
  const balance = p.economy.seeds;
  p = equipItem(p, 'grassTool', null).progress;
  assert.equal(grassEquipment(p.economy).radius, 25);
  assert.equal(grassEquipment(p.economy).color, '#749FB7');
  p = equipItem(p, 'grassAppearance', null).progress;
  assert.equal(grassEquipment(p.economy).color, '#E8C86D');
  assert.equal(p.economy.seeds, balance);
  assert.equal(equipItem(p, 'grassTool', 'mower-blue').ok, false);
  assert.equal(equipItem(p, 'grassAppearance', 'mower-coral').ok, false);
});
test('faixa larga cobre mais área real, com o mesmo campo e sem sobreposição dupla', () => {
  let p = buyItem(rich(), 'mower-wide').progress;
  p = equipItem(p, 'grassTool', 'mower-wide').progress;
  const standard = createCoverage();
  const wide = createCoverage();
  const from = { x: 0, y: 220 },
    to = { x: 320, y: 220 };
  cutSegment(standard, from, to, 25);
  cutSegment(wide, from, to, grassEquipment(p.economy).radius);
  assert.equal(standard.total, TOTAL_CELLS);
  assert.equal(wide.total, TOTAL_CELLS);
  assert.ok(wide.count > standard.count);
  const count = wide.count;
  cutSegment(wide, to, from, 31.25);
  assert.equal(wide.count, count);
});
test('decoração se move, substitui e retorna ao inventário sem duplicar ou destruir', () => {
  let p = buyItem(
    buyItem(rich(), 'garden-pot').progress,
    'garden-bench',
  ).progress;
  const before = p.economy.seeds;
  p = placeDecoration(p, 'back-left', 'garden-pot').progress;
  assert.equal(p.economy.seeds, before + 10);
  p = placeDecoration(p, 'back-right', 'garden-pot').progress;
  assert.equal(p.economy.garden['back-left'], null);
  assert.equal(
    Object.values(p.economy.garden).filter((id) => id === 'garden-pot').length,
    1,
  );
  p = placeDecoration(p, 'back-right', 'garden-bench').progress;
  p = placeDecoration(p, 'back-right', null).progress;
  assert.equal(Object.values(p.economy.garden).filter(Boolean).length, 0);
  assert.deepEqual(p.economy.ownedItemIds, ['garden-pot', 'garden-bench']);
  assert.equal(p.economy.seeds, before + 10);
  assert.equal(placeDecoration(p, 'back-left', 'mower-blue').ok, false);
});
test('Explorador por três tipos guiados, concedido uma única vez', () => {
  let p = initialProgress(now);
  for (const id of ['jardim', 'window', 'sand']) p = completeStage(p, id, now);
  assert.ok(p.economy.achievementIds.includes('explorer'));
  assert.equal(
    p.economy.processedEventIds.filter((id) => id === 'achievement:explorer')
      .length,
    1,
  );
  const before = p.economy.seeds;
  p = completeStage(p, 'sand', now);
  assert.equal(p.economy.seeds, before);
});
test('migração v1/v2 preserva conquistas, evita retroativos e dá presente só uma vez', () => {
  for (const version of [1, 2]) {
    const modern = initialProgress(now);
    const old = {
      version,
      completedStageIds:
        version === 1
          ? ['jardim', 'clareira', 'bosque']
          : ['jardim', 'window', 'sand'],
      daily:
        version === 1
          ? {
              date: modern.daily.date,
              completedStageIds: ['jardim', 'clareira', 'bosque'],
            }
          : {
              ...modern.daily,
              tasks: modern.daily.tasks.map((t) => ({ ...t, completed: true })),
            },
      preferences: { reducedMotion: true },
      recentSessionIds: [],
    };
    const migrated = decodeProgress(JSON.stringify(old), now);
    assert.equal(migrated.version, 3);
    assert.equal(migrated.economy.seeds, 50);
    assert.equal(migrated.economy.xp, 0);
    assert.deepEqual(migrated.completedStageIds, old.completedStageIds);
    assert.ok(
      migrated.economy.processedEventIds.includes(
        `daily-bonus:${modern.daily.date}`,
      ),
    );
    assert.deepEqual(decodeProgress(JSON.stringify(migrated), now), migrated);
    const repeat = completeSession(
      migrated,
      {
        id: 'retry-old',
        mode: 'trail',
        game: 'grass',
        stageId: 'jardim',
        variation: 0,
        day: modern.daily.date,
      },
      now,
    );
    assert.equal(repeat.economy.seeds, 50);
  }
});
test('economia inválida não é sobrescrita ou silenciosamente corrigida', () => {
  const p = initialProgress(now);
  p.economy.seeds = -1;
  assert.throws(() => decodeProgress(JSON.stringify(p), now));
  p.economy.seeds = 50;
  p.economy.equipped.grassTool = 'garden-pot';
  assert.throws(() => decodeProgress(JSON.stringify(p), now));
});
function memory() {
  let data: string | null = null;
  let fail = false;
  return {
    storage: {
      async getItem(_key: string) {
        return data;
      },
      async setItem(_key: string, value: string) {
        if (fail) throw Error('disk');
        data = value;
      },
    },
    fail(value: boolean) {
      fail = value;
    },
    read: () => data,
  };
}
test('transações próximas usam o saldo confirmado mais recente e sobrevivem à reabertura', async () => {
  const disk = memory();
  const repo = createProgressRepository(disk.storage);
  await repo.save(rich());
  const tx = createTransactions(repo);
  await tx.load();
  const [a, b, c] = await Promise.all([
    tx.run((p) => buyItem(p, 'mower-blue')),
    tx.run((p) => buyItem(p, 'mower-blue')),
    tx.run((p) => buyItem(p, 'garden-pot')),
  ]);
  assert.ok(a.ok && b.ok && c.ok);
  assert.equal(tx.getSnapshot().progress!.economy.seeds, 910);
  await tx.run((p) => equipItem(p, 'grassAppearance', 'mower-blue'));
  await tx.run((p) => placeDecoration(p, 'entrance', 'garden-pot'));
  const reopen = createTransactions(createProgressRepository(disk.storage));
  await reopen.load();
  assert.deepEqual(reopen.getSnapshot().progress, tx.getSnapshot().progress);
});
test('falha de gravação não mostra aquisição/saldo otimistas e retry não cobra duas vezes', async () => {
  const disk = memory();
  const tx = createTransactions(createProgressRepository(disk.storage));
  await tx.load();
  const before = tx.getSnapshot().progress;
  disk.fail(true);
  const failed = await tx.run((p) => buyItem(p, 'mower-blue'), 'buy-blue');
  assert.equal(failed.ok, false);
  assert.equal(failed.storageError, true);
  assert.equal(tx.getSnapshot().progress, before);
  disk.fail(false);
  await tx.retry();
  await tx.retry();
  assert.equal(tx.getSnapshot().progress!.economy.seeds, 20);
  assert.deepEqual(tx.getSnapshot().progress!.economy.ownedItemIds, [
    'mower-blue',
  ]);
});
test('falha ao ativar economia não publica presente; reset apaga tudo e inicia novo perfil', async () => {
  const disk = memory();
  disk.fail(true);
  const tx = createTransactions(createProgressRepository(disk.storage));
  await assert.rejects(tx.load());
  assert.equal(tx.getSnapshot().progress, null);
  disk.fail(false);
  await tx.load();
  await tx.run((p) => buyItem(p, 'mower-blue'));
  await tx.reset();
  const p = tx.getSnapshot().progress!;
  assert.equal(p.economy.seeds, 50);
  assert.equal(p.economy.xp, 0);
  assert.deepEqual(p.economy.ownedItemIds, []);
  assert.equal(JSON.parse(disk.read()!).economy.seeds, 50);
});

test('retry depois da meia-noite preserva o novo trio e remunera somente a etapa pendente', () => {
  const p = initialProgress(now);
  const task = p.daily.tasks[0]!;
  const tomorrow = new Date(2026, 8, 15, 1);
  const next = renewDay(p, tomorrow);
  const done = completeSession(
    next,
    {
      id: 'late-retry',
      mode: 'daily',
      game: task.game,
      variation: task.variation,
      taskId: task.id,
      day: p.daily.date,
    },
    tomorrow,
  );
  assert.equal(done.daily.date, '2026-09-15');
  assert.ok(done.daily.tasks.every((t) => !t.completed));
  assert.deepEqual(done.completedStageIds, ['jardim']);
  assert.equal(done.economy.seeds, 80);
  assert.equal(done.economy.xp, 30);
});
test('todas as decorações ocupam posições compatíveis e reaparecem após serialização', () => {
  let p = rich();
  for (const [id, slot] of [
    ['garden-pot', 'back-left'],
    ['garden-stones', 'back-right'],
    ['garden-bench', 'front-left'],
    ['garden-tree', 'front-right'],
    ['garden-fountain', 'entrance'],
  ] as const) {
    const bought = buyItem(p, id);
    assert.equal(bought.ok, true);
    p = placeDecoration(bought.progress, slot, id).progress;
  }
  const restored = decodeProgress(JSON.stringify(p), now);
  assert.equal(new Set(Object.values(restored.economy.garden)).size, 5);
  assert.deepEqual(restored.economy.garden, p.economy.garden);
});
test('carregamentos concorrentes compartilham uma única ativação da economia', async () => {
  const disk = memory();
  let writes = 0;
  const repo = createProgressRepository({
    getItem: disk.storage.getItem,
    async setItem(k, v) {
      writes++;
      await disk.storage.setItem(k, v);
    },
  });
  const tx = createTransactions(repo);
  await Promise.all([tx.load(), tx.load(), tx.load()]);
  assert.equal(writes, 1);
  await tx.run((p) => buyItem(p, 'mower-blue'));
  await tx.load();
  assert.equal(tx.getSnapshot().progress!.economy.seeds, 20);
  assert.equal(writes, 2);
});
test('snapshot só muda após gravar; conclusão e compra na fila não perdem atualização', async () => {
  const disk = memory();
  const tx = createTransactions(createProgressRepository(disk.storage));
  await tx.load();
  const [conclusion, purchase] = await Promise.all([
    tx.run((p) => ({
      progress: completeStage(p, 'jardim', new Date()),
      ok: true,
      message: '',
    })),
    tx.run((p) => buyItem(p, 'garden-pot')),
  ]);
  assert.ok(conclusion.ok && purchase.ok);
  assert.equal(tx.getSnapshot().progress!.economy.seeds, 35);
  assert.deepEqual(tx.getSnapshot().progress!.economy.ownedItemIds, [
    'garden-pot',
  ]);
});
