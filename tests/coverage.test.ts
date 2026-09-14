import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BRUSH_RADIUS, CELL_SIZE, COLUMNS, COMPLETION_RATIO, FIELD_HEIGHT, FIELD_WIDTH, TOTAL_CELLS, clampPoint, createCoverage, cutSegment, fitField } from '../src/minigames/grass/coverage';

test('passar na mesma região, inclusive em sentido contrário, não conta duas vezes', () => {
  const field = createCoverage();
  const from = { x: 50, y: 100 };
  const to = { x: 250, y: 100 };
  cutSegment(field, from, to);
  const firstCount = field.count;
  assert.ok(firstCount > 0);
  for (let i = 0; i < 500; i++) {
    assert.equal(cutSegment(field, i % 2 ? to : from, i % 2 ? from : to).changed.length, 0);
  }
  assert.equal(field.count, firstCount);
  assert.equal(field.cells.reduce((sum, value) => sum + value, 0), firstCount);
});

test('um gesto rápido de ponta a ponta corta todo o corredor entre eventos', () => {
  const field = createCoverage();
  const y = 200;
  cutSegment(field, { x: 0, y }, { x: FIELD_WIDTH, y });
  for (let index = 0; index < TOTAL_CELLS; index++) {
    const centerY = (Math.floor(index / COLUMNS) + 0.5) * CELL_SIZE;
    assert.equal(field.cells[index], Math.abs(centerY - y) <= BRUSH_RADIUS ? 1 : 0);
  }
});

test('diagonal rápida e a mesma diagonal em 100 pequenos movimentos cobrem a mesma área', () => {
  const fast = createCoverage();
  const slow = createCoverage();
  cutSegment(fast, { x: 0, y: 0 }, { x: FIELD_WIDTH, y: FIELD_HEIGHT });
  for (let i = 0; i < 100; i++) {
    cutSegment(slow, { x: FIELD_WIDTH * i / 100, y: FIELD_HEIGHT * i / 100 }, { x: FIELD_WIDTH * (i + 1) / 100, y: FIELD_HEIGHT * (i + 1) / 100 });
  }
  assert.deepEqual(fast.cells, slow.cells);
});

test('toques separados não criam um corte fantasma ligando os pontos', () => {
  const field = createCoverage();
  const a = { x: 35, y: 200 };
  const b = { x: 285, y: 200 };
  cutSegment(field, a, a);
  cutSegment(field, b, b);
  assert.equal(field.cells[Math.floor(200 / CELL_SIZE) * COLUMNS + Math.floor(160 / CELL_SIZE)], 0);
});

test('conclusão ocorre uma vez a partir de 95%, sem exigir os resíduos', () => {
  const field = createCoverage();
  let completions = 0;
  let lastCount = 0;
  for (let y = 0; y <= FIELD_HEIGHT + 20; y += 30) {
    if (cutSegment(field, { x: 0, y }, { x: FIELD_WIDTH, y }).justCompleted) {
      completions++;
      assert.ok(lastCount / TOTAL_CELLS < COMPLETION_RATIO);
      assert.ok(field.count / TOTAL_CELLS >= COMPLETION_RATIO);
      assert.ok(field.count < TOTAL_CELLS, 'a pessoa não precisou cortar cada célula');
    }
    lastCount = field.count;
  }
  assert.equal(completions, 1);
  assert.equal(field.completed, true);
  assert.equal(cutSegment(field, { x: 0, y: 0 }, { x: 320, y: 448 }).justCompleted, false);
  assert.equal(field.count, lastCount);
});

test('cantos e bordas pertencem ao campo e são alcançáveis', () => {
  const field = createCoverage();
  for (const point of [{ x: 0, y: 0 }, { x: 320, y: 0 }, { x: 0, y: 448 }, { x: 320, y: 448 }]) cutSegment(field, point, point);
  for (const index of [0, COLUMNS - 1, TOTAL_CELLS - COLUMNS, TOTAL_CELLS - 1]) assert.equal(field.cells[index], 1);
  assert.deepEqual(clampPoint({ x: -100, y: 700 }), { x: 0, y: 448 });
});

test('o campo cabe em áreas pequenas, altas, largas e de tablet sem distorção', () => {
  for (const [width, height] of [[240, 220], [320, 480], [390, 650], [700, 260], [800, 1000], [0, 0]]) {
    const field = fitField(width!, height!);
    assert.ok(field.width <= width! + 0.001);
    assert.ok(field.height <= height! + 0.001);
    if (field.scale > 0) {
      assert.ok(Math.abs(field.width / field.height - FIELD_WIDTH / FIELD_HEIGHT) < 0.00001);
      assert.equal(field.width / field.scale, FIELD_WIDTH);
    }
  }
});

test('memória da malha é fixa e cada célula gera geometria no máximo uma vez', () => {
  const field = createCoverage();
  const emitted = new Set<number>();
  let random = 1234;
  const next = () => { random = (random * 16807) % 2147483647; return random / 2147483647; };
  for (let i = 0; i < 2000; i++) {
    const from = { x: next() * FIELD_WIDTH, y: next() * FIELD_HEIGHT };
    const to = { x: next() * FIELD_WIDTH, y: next() * FIELD_HEIGHT };
    const result = cutSegment(field, from, to);
    for (const index of result.changed) {
      assert.equal(emitted.has(index), false);
      emitted.add(index);
    }
    assert.equal(field.cells.length, TOTAL_CELLS);
    assert.ok(field.count <= TOTAL_CELLS);
  }
  assert.equal(emitted.size, field.count);
});
