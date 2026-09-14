import { Point } from '../grass/coverage';
export type Piece = { home: Point; target: Point; group: number };
export const BALL_TARGETS: Point[] = [
  { x: 58, y: 125 },
  { x: 160, y: 125 },
  { x: 262, y: 125 },
];
export const STONE_TARGETS: Point[] = [
  { x: 85, y: 92 },
  { x: 235, y: 92 },
  { x: 85, y: 215 },
  { x: 235, y: 215 },
];
export function makePieces(balls: boolean): Piece[] {
  return balls
    ? Array.from({ length: 6 }, (_, i) => ({
        home: { x: 60 + (i % 3) * 100, y: 280 + Math.floor(i / 3) * 95 },
        target: BALL_TARGETS[(i + 1) % 3]!,
        group: (i + 1) % 3,
      }))
    : STONE_TARGETS.map((target, i) => ({
        home: { x: 48 + i * 75, y: 365 },
        target,
        group: i,
      }));
}
export function hitPiece(pieces: Piece[], placed: number[], p: Point) {
  'worklet';
  let selected = -1;
  let nearest = 38 ** 2;
  for (let i = 0; i < pieces.length; i++) {
    const home = pieces[i]!.home;
    const distance = (home.x - p.x) ** 2 + (home.y - p.y) ** 2;
    if (!placed[i] && distance < nearest) {
      selected = i;
      nearest = distance;
    }
  }
  return selected;
}
export function fits(piece: Piece, p: Point) {
  'worklet';
  return (piece.target.x - p.x) ** 2 + (piece.target.y - p.y) ** 2 <= 48 ** 2;
}
