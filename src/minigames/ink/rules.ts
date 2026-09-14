import { Point } from '../grass/coverage';
export const INK_LIMIT = 24;
export const INK_INTERACTIONS = 3;
export type InkDrop = Point & { radius: number; target: number; color: number };
export type InkState = { drops: InkDrop[]; next: number; counts: number[] };
export function createInk(): InkState {
  return { drops: [], next: 0, counts: [0, 0, 0] };
}
export function addInk(
  state: InkState,
  p: Point,
  color: number,
  reduced: boolean,
) {
  'worklet';
  const target = 33 + (state.next % 4) * 6;
  const drop = { ...p, radius: reduced ? target : 7, target, color };
  if (state.drops.length < INK_LIMIT) state.drops.push(drop);
  else state.drops[state.next % INK_LIMIT] = drop;
  state.next = (state.next + 1) % INK_LIMIT;
}
export function countInk(state: InkState, color: number) {
  'worklet';
  state.counts[color] = Math.min(INK_INTERACTIONS, state.counts[color]! + 1);
}
export function expandInk(state: InkState, seconds: number) {
  'worklet';
  for (const drop of state.drops)
    drop.radius = Math.min(
      drop.target,
      drop.radius + Math.max(0, seconds) * 30,
    );
}
