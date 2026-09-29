import assert from 'node:assert/strict';
import test from 'node:test';
import { createCoverage } from '../src/minigames/grass/coverage';
import { completionResidue } from '../src/minigames/surface/three/visualCompletion';

test('acabamento visual final não altera cobertura, progresso nem elegibilidade', () => {
  const coverage = createCoverage((x, y) => x < 200 && y < 350);
  assert.deepEqual(completionResidue(coverage), []);
  for (let i = 0; i < coverage.cells.length; i++) if (coverage.eligible[i] && i % 20) { coverage.cells[i] = 1; coverage.count++; }
  coverage.completed = true;
  const before = structuredClone(coverage);
  const residue = completionResidue(coverage);
  assert.ok(residue.length > 0);
  assert.ok(residue.every(i => coverage.eligible[i] === 1 && coverage.cells[i] === 0));
  assert.equal(residue.length + coverage.count, coverage.total);
  assert.deepEqual(coverage, before);
});
