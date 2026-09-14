import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startSand, moveSand, endSand } from '../src/minigames/sand/rules';
import {
  FLOWER_LIMIT,
  FLOWERS_PER_REGION,
  REGIONS,
  createFlowers,
  plantSegment,
} from '../src/minigames/flowers/rules';
import {
  INK_LIMIT,
  addInk,
  countInk,
  createInk,
  expandInk,
} from '../src/minigames/ink/rules';
import { FRUITS, sliceFruit } from '../src/minigames/fruit/rules';
test('areia exige quatro percursos amplos, sem avaliar precisão e sem contar jitter', () => {
  const s = { start: { x: 0, y: 0 }, extent: 0, count: 0 };
  startSand(s, { x: 100, y: 100 });
  for (let i = 0; i < 1000; i++) moveSand(s, { x: 100 + (i % 2), y: 100 });
  endSand(s, true);
  assert.equal(s.count, 0);
  for (let i = 0; i < 4; i++) {
    startSand(s, { x: 20, y: 30 });
    moveSand(s, { x: 280, y: 220 });
    endSand(s, true);
  }
  assert.equal(s.count, 4);
  endSand(s, true);
  assert.equal(s.count, 4);
});
test('cancelar gesto na areia não apaga caminhos já concluídos', () => {
  const s = { start: { x: 0, y: 0 }, extent: 200, count: 2 };
  endSand(s, false);
  assert.equal(s.count, 2);
});
test('flores interpolam gestos, contam cada posição uma vez e atingem as quatro regiões', () => {
  const s = createFlowers();
  assert.ok(plantSegment(s, { x: 0, y: 110 }, { x: 320, y: 110 }).length >= 16);
  assert.equal(plantSegment(s, { x: 0, y: 110 }, { x: 320, y: 110 }).length, 0);
  for (const region of REGIONS)
    for (const dy of [-20, 0, 20])
      plantSegment(
        s,
        { x: region.x - 45, y: region.y + dy },
        { x: region.x + 45, y: region.y + dy },
      );
  assert.deepEqual(s.regions, [8, 8, 8, 8]);
  for (let y = 0; y < 448; y += 5) plantSegment(s, { x: 0, y }, { x: 320, y });
  assert.equal(s.cells.length, FLOWER_LIMIT);
  assert.ok(s.regions.every((n) => n <= FLOWERS_PER_REGION));
});
test('tinta limita manchas e expansão; a meta pede três interações por cor', () => {
  const s = createInk();
  for (let i = 0; i < 1000; i++) addInk(s, { x: 100, y: 100 }, i % 3, false);
  assert.equal(s.drops.length, INK_LIMIT);
  for (let color = 0; color < 3; color++)
    for (let n = 0; n < 10; n++) countInk(s, color);
  assert.deepEqual(s.counts, [3, 3, 3]);
  expandInk(s, 100);
  assert.ok(s.drops.every((d) => d.radius === d.target));
  const reduced = createInk();
  addInk(reduced, { x: 20, y: 30 }, 0, true);
  assert.equal(reduced.drops[0]!.radius, reduced.drops[0]!.target);
});
test('frutas aceitam gestos lentos e rápidos; toque parado e repetição não somam', () => {
  const state = [0, 0, 0, 0, 0, 0];
  sliceFruit(state, FRUITS[0]!, FRUITS[0]!);
  assert.deepEqual(state, [0, 0, 0, 0, 0, 0]);
  sliceFruit(state, { x: 80, y: 95 }, { x: 80.1, y: 95 });
  assert.equal(state[0], 1);
  for (const y of [95, 223, 351]) sliceFruit(state, { x: 0, y }, { x: 320, y });
  assert.deepEqual(state, [1, 1, 1, 1, 1, 1]);
  sliceFruit(state, { x: 0, y: 95 }, { x: 320, y: 95 });
  assert.equal(
    state.reduce((a, b) => a + b, 0),
    6,
  );
});
