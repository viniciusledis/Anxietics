import { Point } from '../grass/coverage';
export const FLOWER_SPACING = 20;
export const FLOWER_COLUMNS = 16;
export const FLOWER_ROWS = 22;
export const FLOWER_LIMIT = FLOWER_COLUMNS * FLOWER_ROWS;
export const REGIONS: Point[] = [
  { x: 80, y: 112 },
  { x: 240, y: 112 },
  { x: 80, y: 322 },
  { x: 240, y: 322 },
];
export const FLOWERS_PER_REGION = 8;
export function flowerPoint(index: number): Point {
  'worklet';
  return {
    x: ((index % FLOWER_COLUMNS) + 0.5) * FLOWER_SPACING,
    y: (Math.floor(index / FLOWER_COLUMNS) + 0.5) * FLOWER_SPACING,
  };
}
export type FlowerState = { cells: number[]; regions: number[] };
export function createFlowers(): FlowerState {
  return { cells: new Array(FLOWER_LIMIT).fill(0), regions: [0, 0, 0, 0] };
}
export function plantSegment(state: FlowerState, from: Point, to: Point) {
  'worklet';
  const changed: number[] = [];
  const steps = Math.max(
    1,
    Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / (FLOWER_SPACING / 2)),
  );
  for (let step = 0; step <= steps; step++) {
    const x = from.x + ((to.x - from.x) * step) / steps;
    const y = from.y + ((to.y - from.y) * step) / steps;
    const col = Math.max(
      0,
      Math.min(FLOWER_COLUMNS - 1, Math.floor(x / FLOWER_SPACING)),
    );
    const row = Math.max(
      0,
      Math.min(FLOWER_ROWS - 1, Math.floor(y / FLOWER_SPACING)),
    );
    const index = row * FLOWER_COLUMNS + col;
    if (state.cells[index]) continue;
    state.cells[index] = 1;
    changed.push(index);
    const p = flowerPoint(index);
    for (let i = 0; i < REGIONS.length; i++)
      if (Math.hypot(p.x - REGIONS[i]!.x, p.y - REGIONS[i]!.y) <= 60)
        state.regions[i] = Math.min(FLOWERS_PER_REGION, state.regions[i]! + 1);
  }
  return changed;
}
