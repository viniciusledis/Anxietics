import { Point, distanceToSegmentSquared } from '../grass/coverage';
export const FRUITS: Point[] = [
  { x: 80, y: 95 },
  { x: 240, y: 95 },
  { x: 80, y: 223 },
  { x: 240, y: 223 },
  { x: 80, y: 351 },
  { x: 240, y: 351 },
];
export function sliceFruit(sliced: number[], from: Point, to: Point) {
  'worklet';
  if (Math.hypot(to.x - from.x, to.y - from.y) === 0) return;
  for (let i = 0; i < FRUITS.length; i++)
    if (!sliced[i] && distanceToSegmentSquared(FRUITS[i]!, from, to) <= 32 ** 2)
      sliced[i] = 1;
}
