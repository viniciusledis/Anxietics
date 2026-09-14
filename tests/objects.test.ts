import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makePieces, hitPiece, fits } from '../src/minigames/arrange/rules';
import { POTS, WATER_SECONDS, waterAt } from '../src/minigames/water/rules';
import { CONSTELLATIONS, lightSegment } from '../src/minigames/lights/rules';
test('pedras e bolinhas têm encaixes alcançáveis, com atração generosa e sem recontagem', () => {
  for (const balls of [false, true]) {
    const pieces = makePieces(balls);
    const placed = pieces.map(() => 0);
    pieces.forEach((piece, index) => {
      assert.equal(hitPiece(pieces, placed, piece.home), index);
      assert.equal(
        fits(piece, { x: piece.target.x + 35, y: piece.target.y }),
        true,
      );
      assert.equal(fits(piece, piece.home), false);
      placed[index] = 1;
      assert.equal(hitPiece(pieces, placed, piece.home), -1);
    });
    assert.equal(
      placed.reduce((a, b) => a + b, 0),
      pieces.length,
    );
  }
});
test('bolinha em recipiente com símbolo errado não encaixa', () => {
  const pieces = makePieces(true);
  assert.equal(fits(pieces[0]!, pieces[1]!.target), false);
});
test('rega depende de permanência no vaso, satura e nunca penaliza excesso', () => {
  const levels = [0, 0, 0, 0];
  waterAt(levels, { x: 160, y: 440 }, 99);
  assert.deepEqual(levels, [0, 0, 0, 0]);
  for (const pot of POTS) waterAt(levels, pot, WATER_SECONDS);
  assert.deepEqual(levels, [1, 1, 1, 1]);
  waterAt(levels, POTS[0]!, 100);
  assert.deepEqual(levels, [1, 1, 1, 1]);
});
test('cada constelação conclui com toques separados; não exige gesto contínuo', () => {
  for (const points of CONSTELLATIONS) {
    let lit = 0;
    assert.equal(lightSegment(points, lit, points[2]!, points[2]!), 0);
    for (const p of points) lit = lightSegment(points, lit, p, p);
    assert.equal(lit, points.length);
    assert.equal(lightSegment(points, lit, points[0]!, points[0]!), lit);
  }
});
test('segmento rápido acende pontos em ordem sem saltar lacunas do gesto', () => {
  const points = [
    { x: 30, y: 100 },
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 290, y: 100 },
  ];
  assert.equal(
    lightSegment(points, 0, { x: 0, y: 100 }, { x: 320, y: 100 }),
    4,
  );
  assert.equal(
    lightSegment(points, 0, { x: 320, y: 100 }, { x: 0, y: 100 }),
    1,
  );
});
