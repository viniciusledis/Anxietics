import { Point, distanceToSegmentSquared } from '../grass/coverage';
export const POTS: Point[] = [
  { x: 85, y: 145 },
  { x: 235, y: 145 },
  { x: 85, y: 310 },
  { x: 235, y: 310 },
];
export const WATER_SECONDS = 4;
export function waterAt(levels: number[], p: Point, seconds: number) {
  'worklet';
  for (let i = 0; i < POTS.length; i++) {
    if (distanceToSegmentSquared(POTS[i]!, p, p) <= 48 ** 2)
      levels[i] = Math.min(
        1,
        levels[i]! + Math.max(0, seconds) / WATER_SECONDS,
      );
  }
}
