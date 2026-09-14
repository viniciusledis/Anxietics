import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createCoverage,
  cutSegment,
  TOTAL_CELLS,
} from '../src/minigames/grass/coverage';
import { insideVase } from '../src/minigames/surface/geometry';
test('lavagem exclui o fundo e termina ao limpar apenas o objeto', () => {
  const field = createCoverage(insideVase);
  assert.ok(field.total < TOTAL_CELLS / 2);
  cutSegment(field, { x: 0, y: 0 }, { x: 320, y: 0 });
  assert.equal(field.count, 0);
  for (let y = 70; y < 420; y += 25)
    cutSegment(field, { x: 30, y }, { x: 290, y });
  assert.equal(field.completed, true);
  assert.ok(field.count / field.total >= 0.95);
  assert.ok(field.cells.every((value, i) => !value || field.eligible[i] === 1));
});
test('superfície sem área válida não conclui nem divide progresso em área do fundo', () => {
  const field = createCoverage(() => false);
  assert.equal(
    cutSegment(field, { x: 0, y: 0 }, { x: 320, y: 448 }).justCompleted,
    false,
  );
  assert.equal(field.count, 0);
});
