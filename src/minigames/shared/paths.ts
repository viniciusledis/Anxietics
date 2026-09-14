import { SkPath } from '@shopify/react-native-skia';
import {
  CELL_SIZE,
  COLUMNS,
  FIELD_WIDTH,
  FIELD_HEIGHT,
} from '../grass/coverage';

export function appendCells(
  path: SkPath,
  changed: number[],
  complete: boolean,
) {
  'worklet';
  if (complete) {
    path.reset();
    path.addRect({ x: 0, y: 0, width: FIELD_WIDTH, height: FIELD_HEIGHT });
    return;
  }
  for (let i = 0; i < changed.length; i++) {
    const first = changed[i]!;
    let last = first;
    while (
      i + 1 < changed.length &&
      changed[i + 1] === last + 1 &&
      Math.floor(changed[i + 1]! / COLUMNS) === Math.floor(first / COLUMNS)
    )
      last = changed[++i]!;
    path.addRect({
      x: (first % COLUMNS) * CELL_SIZE,
      y: Math.floor(first / COLUMNS) * CELL_SIZE,
      width: (last - first + 1) * CELL_SIZE,
      height: CELL_SIZE,
    });
  }
}
