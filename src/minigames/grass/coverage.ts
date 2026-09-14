// Motor sem dependência de React ou Skia: pode ser testado no Node.
// O campo usa coordenadas lógicas; a tela apenas aplica uma escala uniforme.
export const FIELD_WIDTH = 320;
export const FIELD_HEIGHT = 448;
export const CELL_SIZE = 4;
export const COLUMNS = FIELD_WIDTH / CELL_SIZE;
export const ROWS = FIELD_HEIGHT / CELL_SIZE;
export const TOTAL_CELLS = COLUMNS * ROWS;
export const BRUSH_RADIUS = 25;
export const COMPLETION_RATIO = 0.95;

export type Point = { x: number; y: number };
export type Coverage = { cells: number[]; count: number; completed: boolean };

export function createCoverage(): Coverage {
  return { cells: new Array<number>(TOTAL_CELLS).fill(0), count: 0, completed: false };
}

export function clampPoint(point: Point): Point {
  'worklet';
  return { x: Math.max(0, Math.min(FIELD_WIDTH, point.x)), y: Math.max(0, Math.min(FIELD_HEIGHT, point.y)) };
}

export function distanceToSegmentSquared(point: Point, from: Point, to: Point): number {
  'worklet';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((point.x - from.x) * dx + (point.y - from.y) * dy) / lengthSquared));
  return (point.x - from.x - t * dx) ** 2 + (point.y - from.y - t * dy) ** 2;
}

// Marca a cápsula inteira entre dois eventos, mesmo se o sistema pular pontos.
// A mutação é intencional: na tela, ocorre dentro de SharedValue.modify, na UI thread.
export function cutSegment(coverage: Coverage, from: Point, to: Point) {
  'worklet';
  const changed: number[] = [];
  if (coverage.completed) return { changed, justCompleted: false };
  const minCol = Math.max(0, Math.floor((Math.min(from.x, to.x) - BRUSH_RADIUS) / CELL_SIZE));
  const maxCol = Math.min(COLUMNS - 1, Math.floor((Math.max(from.x, to.x) + BRUSH_RADIUS) / CELL_SIZE));
  const minRow = Math.max(0, Math.floor((Math.min(from.y, to.y) - BRUSH_RADIUS) / CELL_SIZE));
  const maxRow = Math.min(ROWS - 1, Math.floor((Math.max(from.y, to.y) + BRUSH_RADIUS) / CELL_SIZE));

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const index = row * COLUMNS + col;
      if (coverage.cells[index]) continue;
      const center = { x: (col + 0.5) * CELL_SIZE, y: (row + 0.5) * CELL_SIZE };
      if (distanceToSegmentSquared(center, from, to) <= BRUSH_RADIUS ** 2) {
        coverage.cells[index] = 1;
        coverage.count += 1;
        changed.push(index);
      }
    }
  }
  const justCompleted = coverage.count / TOTAL_CELLS >= COMPLETION_RATIO;
  if (justCompleted) coverage.completed = true;
  return { changed, justCompleted };
}

export function fitField(width: number, height: number) {
  const scale = Math.max(0, Math.min(width / FIELD_WIDTH, height / FIELD_HEIGHT));
  return { width: FIELD_WIDTH * scale, height: FIELD_HEIGHT * scale, scale };
}
