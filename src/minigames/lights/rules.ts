import { Point, distanceToSegmentSquared } from '../grass/coverage';
export const CONSTELLATIONS: Point[][] = [
  [
    { x: 70, y: 365 },
    { x: 95, y: 270 },
    { x: 75, y: 160 },
    { x: 160, y: 65 },
    { x: 245, y: 160 },
    { x: 225, y: 270 },
    { x: 160, y: 325 },
    { x: 145, y: 200 },
  ],
  [
    { x: 35, y: 340 },
    { x: 85, y: 205 },
    { x: 125, y: 260 },
    { x: 185, y: 100 },
    { x: 285, y: 340 },
    { x: 210, y: 370 },
    { x: 130, y: 370 },
  ],
  [
    { x: 55, y: 280 },
    { x: 135, y: 280 },
    { x: 135, y: 100 },
    { x: 250, y: 255 },
    { x: 285, y: 280 },
    { x: 245, y: 345 },
    { x: 95, y: 345 },
  ],
];
export function lightSegment(
  points: Point[],
  lit: number,
  from: Point,
  to: Point,
) {
  'worklet';
  // O próximo ponto deve aparecer depois do anterior no percurso deste segmento.
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = dx * dx + dy * dy;
  let lastT = -1;
  while (lit < points.length) {
    const p = points[lit]!;
    const t = length
      ? Math.max(
          0,
          Math.min(1, ((p.x - from.x) * dx + (p.y - from.y) * dy) / length),
        )
      : 0;
    if (t < lastT || distanceToSegmentSquared(p, from, to) > 30 ** 2) break;
    lastT = t;
    lit++;
  }
  return lit;
}
