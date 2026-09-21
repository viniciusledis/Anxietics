import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera, Vector3 } from 'three';
import {
  FIELD_HEIGHT,
  FIELD_WIDTH,
  createCoverage,
  cutSegment,
} from '../src/minigames/grass/coverage';
import { LawnController } from '../src/minigames/grass/three/LawnController';
import {
  SURFACE_Y,
  TILES,
  TUFTS,
  logicalToWorld,
  screenToLogical,
  tileIndexForCell,
  tuftIndexForCell,
  worldToLogical,
} from '../src/minigames/grass/three/sceneModel';

test('projeção perspectiva mantém o dedo alinhado ao campo lógico', () => {
  const width = 390;
  const height = 580;
  const camera = new PerspectiveCamera(35, width / height, 0.1, 60);
  camera.position.set(3.2, 11.1, 7.7);
  camera.lookAt(0, 0.15, 0);
  camera.updateMatrixWorld();
  for (const point of [
    { x: 0, y: 0 },
    { x: 160, y: 224 },
    { x: 320, y: 448 },
    { x: 60, y: 380 },
  ]) {
    const world = logicalToWorld(point);
    const projected = new Vector3(world.x, SURFACE_Y, world.z).project(camera);
    const result = screenToLogical(
      (projected.x + 1) * width / 2,
      (1 - projected.y) * height / 2,
      width,
      height,
      camera,
    );
    assert.ok(result);
    assert.ok(Math.abs(result.x - point.x) < 0.001);
    assert.ok(Math.abs(result.y - point.y) < 0.001);
  }
  assert.deepEqual(worldToLogical(-100, 100), { x: 0, y: FIELD_HEIGHT });
  assert.deepEqual(worldToLogical(100, -100), { x: FIELD_WIDTH, y: 0 });
});

test('visual 3D acompanha as células da regra 2D sem alterar a cobertura', () => {
  const coverage = createCoverage();
  const scene = new LawnController();
  const first = cutSegment(coverage, { x: 20, y: 20 }, { x: 300, y: 20 });
  scene.cut(first.changed, { x: 300, y: 20 });
  assert.ok(first.changed.length > 0);
  assert.ok(coverage.count > 0);
  assert.ok(scene.tileTargets.some((value) => value > 0));
  assert.ok(scene.tuftTargets.some((value) => value > 0));
  assert.ok(scene.tileTargets[tileIndexForCell(first.changed[0]!)]! >= 0.25);
  assert.ok(scene.tuftTargets[tuftIndexForCell(first.changed[0]!)]! >= 0.0625);
  assert.equal(scene.tileTargets.length, TILES);
  assert.equal(scene.tuftTargets.length, TUFTS);
  scene.celebrate();
  assert.ok(scene.tileTargets.every((value) => value === 1));
  assert.ok(scene.tuftTargets.every((value) => value === 1));
});
