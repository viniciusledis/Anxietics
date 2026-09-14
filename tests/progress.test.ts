import assert from 'node:assert/strict';
import { test } from 'node:test';
import { completeStage, decodeProgress, initialProgress, localDay, renewDay } from '../src/domain/progress';
import { getStageStatus, STAGES } from '../src/trail/stages';

const day = new Date(2026, 8, 14, 15, 0);

test('trilha começa com uma etapa disponível e libera a próxima ao concluir', () => {
  let progress = initialProgress(day);
  assert.deepEqual(STAGES.map(stage => getStageStatus(stage.id, progress.completedStageIds)), ['available', 'locked', 'locked']);
  progress = completeStage(progress, 'jardim', day);
  assert.deepEqual(STAGES.map(stage => getStageStatus(stage.id, progress.completedStageIds)), ['completed', 'available', 'locked']);
});

test('etapas bloqueadas e ids desconhecidos não ganham recompensas', () => {
  const progress = initialProgress(day);
  assert.equal(completeStage(progress, 'bosque', day), progress);
  assert.equal(completeStage(progress, 'frutas', day), progress);
});

test('callback duplicado e repetição não duplicam conquistas nem atividades do dia', () => {
  let progress = completeStage(initialProgress(day), 'jardim', day);
  const once = progress;
  for (let i = 0; i < 30; i++) progress = completeStage(progress, 'jardim', day);
  assert.equal(progress, once);
  assert.equal(progress.completedStageIds.length, 1);
  assert.equal(progress.daily.completedStageIds.length, 1);
});

test('depois das três atividades, todos os campos podem ser repetidos', () => {
  let progress = initialProgress(day);
  for (const stage of STAGES) progress = completeStage(progress, stage.id, day);
  for (const stage of STAGES) assert.equal(getStageStatus(stage.id, progress.completedStageIds), 'completed');
  const before = progress;
  for (const stage of STAGES) progress = completeStage(progress, stage.id, day);
  assert.equal(progress, before);
});

test('virada local do dia renova apenas o registro diário e mantém conquistas e preferências', () => {
  const beforeMidnight = new Date(2026, 8, 14, 23, 59);
  const afterMidnight = new Date(2026, 8, 15, 0, 1);
  const progress = completeStage(initialProgress(beforeMidnight), 'jardim', beforeMidnight);
  progress.preferences.reducedMotion = true;
  assert.equal(renewDay(progress, beforeMidnight), progress);
  const next = renewDay(progress, afterMidnight);
  assert.equal(next.daily.date, '2026-09-15');
  assert.deepEqual(next.daily.completedStageIds, []);
  assert.deepEqual(next.completedStageIds, ['jardim']);
  assert.equal(next.preferences.reducedMotion, true);
  const replay = completeStage(next, 'jardim', afterMidnight);
  assert.deepEqual(replay.completedStageIds, ['jardim']);
  assert.deepEqual(replay.daily.completedStageIds, ['jardim']);
});

test('uma rodada atravessando a meia-noite conta no dia da conclusão', () => {
  const progress = initialProgress(new Date(2026, 8, 14, 23, 59));
  const result = completeStage(progress, 'jardim', new Date(2026, 8, 15, 0, 1));
  assert.equal(result.daily.date, '2026-09-15');
  assert.deepEqual(result.daily.completedStageIds, ['jardim']);
});

test('ausência por vários dias e relógio para trás nunca tiram conquistas', () => {
  const progress = completeStage(initialProgress(day), 'jardim', day);
  for (const when of [new Date(2027, 1, 1), new Date(2026, 0, 1)]) {
    assert.deepEqual(renewDay(progress, when).completedStageIds, ['jardim']);
  }
});

test('dia usa componentes locais e recarga valida dados sem inventar progresso', () => {
  assert.equal(localDay(day), '2026-09-14');
  assert.throws(() => decodeProgress('{', day));
  assert.throws(() => decodeProgress('{"version":2}', day));
  const data = { ...initialProgress(day), completedStageIds: ['jardim', 'jardim', 'bosque', 'inexistente'], daily: { date: localDay(day), completedStageIds: ['jardim', 'jardim', 'bosque'] } };
  const decoded = decodeProgress(JSON.stringify(data), day);
  assert.deepEqual(decoded.completedStageIds, ['jardim']);
  assert.deepEqual(decoded.daily.completedStageIds, ['jardim']);
});
