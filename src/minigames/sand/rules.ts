import { Point } from '../grass/coverage';
export const SAND_PATHS = 4;
export const BROAD_DISTANCE = 150;
export type SandProgress = { start: Point; extent: number; count: number };
export function startSand(state: SandProgress, point: Point) {
  'worklet';
  state.start = point;
  state.extent = 0;
}
export function moveSand(state: SandProgress, point: Point) {
  'worklet';
  state.extent = Math.max(
    state.extent,
    Math.hypot(point.x - state.start.x, point.y - state.start.y),
  );
}
export function endSand(state: SandProgress, success: boolean) {
  'worklet';
  if (success && state.extent >= BROAD_DISTANCE)
    state.count = Math.min(SAND_PATHS, state.count + 1);
  state.extent = 0;
}
