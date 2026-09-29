import { Camera, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { Point } from '../grass/coverage';

const raycaster = new Raycaster();
const ndc = new Vector2();
const plane = new Plane(new Vector3(0, 1, 0), 0);
const hitPoint = new Vector3();

export function worldPoint(point: Point, elevation = 0): [number, number, number] {
  return [(point.x - 160) / 50, elevation, (point.y - 224) / 50];
}

export function logicalPoint(
  x: number,
  y: number,
  width: number,
  height: number,
  camera: Camera | null,
): Point | null {
  if (!camera || width <= 0 || height <= 0) return null;
  camera.updateMatrixWorld();
  ndc.set((x / width) * 2 - 1, 1 - (y / height) * 2);
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.ray.intersectPlane(plane, hitPoint);
  if (!hit) return null;
  return { x: Math.max(0, Math.min(320, hit.x * 50 + 160)), y: Math.max(0, Math.min(448, hit.z * 50 + 224)) };
}
