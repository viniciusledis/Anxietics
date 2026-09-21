import { Camera, Raycaster, Vector2, Vector3 } from 'three';
import {
  CELL_SIZE,
  COLUMNS,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  Point,
  ROWS,
  clampPoint,
} from '../coverage';

export const LAWN_WIDTH = 4;
export const LAWN_DEPTH = 5.6;
export const SURFACE_Y = 0.16;
export const TILE_CELLS = 2;
export const TILE_COLUMNS = COLUMNS / TILE_CELLS;
export const TILE_ROWS = ROWS / TILE_CELLS;
export const TILES = TILE_COLUMNS * TILE_ROWS;
export const TUFT_CELLS = 4;
export const TUFT_COLUMNS = COLUMNS / TUFT_CELLS;
export const TUFT_ROWS = ROWS / TUFT_CELLS;
export const TUFTS = TUFT_COLUMNS * TUFT_ROWS;

export function logicalToWorld(point: Point) {
  return {
    x: (point.x / FIELD_WIDTH - 0.5) * LAWN_WIDTH,
    z: (point.y / FIELD_HEIGHT - 0.5) * LAWN_DEPTH,
  };
}

export function worldToLogical(x: number, z: number): Point {
  return clampPoint({
    x: ((x / LAWN_WIDTH) + 0.5) * FIELD_WIDTH,
    y: ((z / LAWN_DEPTH) + 0.5) * FIELD_HEIGHT,
  });
}

const raycaster = new Raycaster();
const pointer = new Vector2();
const intersection = new Vector3();

// O toque é projetado no plano jogável, mesmo com câmera em perspectiva.
export function screenToLogical(
  x: number,
  y: number,
  width: number,
  height: number,
  camera: Camera | null,
): Point | null {
  if (!camera || width <= 0 || height <= 0) return null;
  pointer.set((x / width) * 2 - 1, 1 - (y / height) * 2);
  raycaster.setFromCamera(pointer, camera);
  const direction = raycaster.ray.direction;
  if (Math.abs(direction.y) < 0.0001) return null;
  const distance = (SURFACE_Y - raycaster.ray.origin.y) / direction.y;
  if (distance < 0) return null;
  raycaster.ray.at(distance, intersection);
  return worldToLogical(intersection.x, intersection.z);
}

export function tileIndexForCell(cell: number) {
  const col = cell % COLUMNS;
  const row = Math.floor(cell / COLUMNS);
  return Math.floor(row / TILE_CELLS) * TILE_COLUMNS + Math.floor(col / TILE_CELLS);
}

export function tuftIndexForCell(cell: number) {
  const col = cell % COLUMNS;
  const row = Math.floor(cell / COLUMNS);
  return Math.floor(row / TUFT_CELLS) * TUFT_COLUMNS + Math.floor(col / TUFT_CELLS);
}
