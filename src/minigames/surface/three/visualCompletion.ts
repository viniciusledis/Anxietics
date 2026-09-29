import { Coverage } from '../../grass/coverage';

/** Residual pixels for the final visual reveal; never changes logical coverage. */
export function completionResidue(coverage: Coverage): number[] {
  if (!coverage.completed) return [];
  const result: number[] = [];
  for (let i = 0; i < coverage.cells.length; i++) if (coverage.eligible[i] && !coverage.cells[i]) result.push(i);
  return result;
}
