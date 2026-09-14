import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  completeStage,
  decodeProgress,
  initialProgress,
  localDay,
  renewDay,
} from '../src/domain/progress';
import { getStageStatus, STAGES } from '../src/trail/stages';
const day = new Date(2026, 8, 14, 15);
test('primeira etapa disponível e sucessora liberada após conquista', () => {
  const p = initialProgress(day);
  assert.equal(getStageStatus('jardim', p.completedStageIds), 'available');
  assert.ok(
    STAGES.slice(1).every(
      (s) => getStageStatus(s.id, p.completedStageIds) === 'locked',
    ),
  );
  const next = completeStage(p, 'jardim', day);
  assert.equal(getStageStatus('window', next.completedStageIds), 'available');
  assert.equal(getStageStatus('sand', next.completedStageIds), 'locked');
});
test('ids desconhecidos e etapas bloqueadas não concedem conquistas', () => {
  const p = initialProgress(day);
  assert.equal(completeStage(p, 'não existe', day), p);
  assert.equal(completeStage(p, 'fruit', day), p);
});
test('callback repetido não duplica recompensa', () => {
  const p = completeStage(initialProgress(day), 'jardim', day);
  assert.equal(completeStage(p, 'jardim', day), p);
});
test('dias de ausência e relógio para trás preservam conquistas e preferências', () => {
  const p = completeStage(initialProgress(day), 'jardim', day);
  p.preferences.reducedMotion = true;
  for (const date of [new Date(2027, 1, 1), new Date(2026, 0, 1)]) {
    const next = renewDay(p, date);
    assert.deepEqual(next.completedStageIds, p.completedStageIds);
    assert.equal(next.preferences.reducedMotion, true);
  }
  assert.equal(localDay(day), '2026-09-14');
});
test('dados inválidos são recusados sem gerar conquistas', () => {
  assert.throws(() => decodeProgress('{', day));
  assert.throws(() => decodeProgress('{"version":3}', day));
  const data = initialProgress(day);
  data.completedStageIds = ['jardim', 'jardim', 'fruit', 'inexistente'];
  assert.deepEqual(
    decodeProgress(JSON.stringify(data), day).completedStageIds,
    ['jardim'],
  );
});
