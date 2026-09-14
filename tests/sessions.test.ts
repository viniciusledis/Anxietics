import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  completeSession,
  completeStage,
  decodeProgress,
  initialProgress,
  renewDay,
} from '../src/domain/progress';
import { STAGES, unlockedGames } from '../src/trail/stages';
const now = new Date(2026, 8, 14, 12);

test('trilha pode marcar diária correspondente; modo livre permanece sem recompensas', () => {
  const first = initialProgress(now);
  const trail = completeStage(first, 'jardim', now);
  assert.deepEqual(trail.completedStageIds, ['jardim']);
  assert.equal(trail.daily.tasks.filter((task) => task.completed).length, 1);
  const task = trail.daily.tasks.find((task) => !task.completed)!;
  const daily = completeSession(
    trail,
    {
      id: 'daily-1',
      mode: 'daily',
      game: task.game,
      variation: task.variation,
      taskId: task.id,
      day: trail.daily.date,
    },
    now,
  );
  assert.equal(daily.daily.tasks.filter((item) => item.completed).length, 2);
  assert.deepEqual(daily.completedStageIds, ['jardim']);
  const free = completeSession(
    daily,
    { id: 'free-1', mode: 'free', game: 'window', variation: 0 },
    now,
  );
  assert.deepEqual(free.completedStageIds, daily.completedStageIds);
  assert.deepEqual(free.daily, daily.daily);
});
test('partida duplicada é idempotente; ids de partida têm memória limitada', () => {
  const session = {
    id: 'a',
    mode: 'trail' as const,
    stageId: 'jardim',
    game: 'grass' as const,
    variation: 0,
  };
  const once = completeSession(initialProgress(now), session, now);
  assert.equal(completeSession(once, session, now), once);
  let p = once;
  for (let i = 0; i < 200; i++)
    p = completeSession(p, { ...session, id: String(i), mode: 'trail' }, now);
  assert.equal(p.recentSessionIds.length, 64);
  assert.deepEqual(p.completedStageIds, ['jardim']);
});
test('todos os 14 jogos ficam disponíveis por uma passagem pela trilha', () => {
  let p = initialProgress(now);
  for (const stage of STAGES) p = completeStage(p, stage.id, now);
  assert.equal(p.completedStageIds.length, 14);
  assert.equal(unlockedGames(p.completedStageIds).length, 14);
  assert.equal(
    completeStage(initialProgress(now), 'fruit', now).completedStageIds.length,
    0,
  );
});
test('tarefas ficam estáveis ao reabrir e desbloquear; renovam apenas ao mudar o dia', () => {
  let p = initialProgress(now);
  const tasks = p.daily;
  for (const stage of STAGES) p = completeStage(p, stage.id, now);
  assert.deepEqual(
    p.daily.tasks.map((t) => [t.id, t.game, t.variation]),
    tasks.tasks.map((t) => [t.id, t.game, t.variation]),
  );
  assert.deepEqual(decodeProgress(JSON.stringify(p), now), p);
  const next = renewDay(p, new Date(2026, 8, 15));
  assert.deepEqual(next.completedStageIds, p.completedStageIds);
  assert.equal(new Set(next.daily.tasks.map((task) => task.game)).size, 3);
  assert.ok(next.daily.tasks.every((task) => !task.completed));
});
test('migração preserva conquistas e dia antigo sem pular novos jogos', () => {
  const old = {
    version: 1,
    completedStageIds: ['jardim', 'clareira', 'bosque'],
    daily: { date: '2026-09-14', completedStageIds: ['jardim', 'clareira'] },
    preferences: { reducedMotion: true },
  };
  const p = decodeProgress(JSON.stringify(old), now);
  assert.deepEqual(p.completedStageIds, old.completedStageIds);
  assert.equal(p.daily.tasks.filter((task) => task.completed).length, 2);
  assert.deepEqual(unlockedGames(p.completedStageIds), ['grass', 'window']);
  assert.equal(p.preferences.reducedMotion, true);
});
test('desenvolvimento não altera progresso; tarefa de ontem não marca tarefa nova', () => {
  const p = initialProgress(now);
  assert.equal(
    completeSession(
      p,
      { id: 'dev', mode: 'dev', game: 'fruit', variation: 0 },
      now,
    ),
    p,
  );
  const task = p.daily.tasks[0]!;
  const next = completeSession(
    p,
    {
      id: 'old',
      mode: 'daily',
      game: task.game,
      variation: task.variation,
      taskId: task.id,
      day: p.daily.date,
    },
    new Date(2026, 8, 15),
  );
  assert.ok(next.daily.tasks.every((t) => !t.completed));
});
