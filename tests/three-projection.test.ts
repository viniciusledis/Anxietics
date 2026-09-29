import assert from 'node:assert/strict';
import test from 'node:test';
import { PerspectiveCamera, Vector3 } from 'three';
import { logicalPoint, worldPoint } from '../src/minigames/three/projection';

test('projeção perspectiva conserva os gestos no campo 3D', () => {
  const width = 350;
  const height = 500;
  for (const position of [
    [3, 14, 11], [-2.4, 13, 12], [-2.8, 14.5, 11], [1.7, 14, 11.5],
    [3.2, 14, 11.5], [3, 14.5, 11], [-1.8, 13.5, 10], [2.3, 13.5, 11.5],
    [1.7, 13.3, 10.8], [-2, 12.5, 10], [2.2, 12.5, 10.5], [-2.3, 12.6, 10.4], [1.4, 12.6, 10.2],
  ]) {
    const camera = new PerspectiveCamera(58, width / height, 0.1, 65);
    camera.position.set(...(position as [number, number, number]));
    camera.lookAt(0, 0, 1);
    camera.updateMatrixWorld();
    for (const point of [
      { x: 0, y: 0 }, { x: 320, y: 0 },
      { x: 0, y: 448 }, { x: 320, y: 448 },
      { x: 85, y: 310 }, { x: 160, y: 224 },
    ]) {
      const projected = new Vector3(...worldPoint(point)).project(camera);
      assert.ok(Math.abs(projected.x) < 0.97, `x fora da tela: ${JSON.stringify(point)}`);
      assert.ok(Math.abs(projected.y) < 0.97, `y fora da tela: ${JSON.stringify(point)}`);
      const result = logicalPoint((projected.x + 1) * width / 2, (1 - projected.y) * height / 2, width, height, camera);
      assert.ok(result);
      assert.ok(Math.abs(result.x - point.x) < 0.001);
      assert.ok(Math.abs(result.y - point.y) < 0.001);
    }
  }
});
