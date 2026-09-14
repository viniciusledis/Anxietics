// A mesma união geométrica delimita o vaso desenhado e a área contabilizada.
export function insideVase(x: number, y: number) {
  return (
    ((x - 160) / 102) ** 2 + ((y - 270) / 120) ** 2 <= 1 ||
    (x >= 120 && x <= 200 && y >= 70 && y <= 205)
  );
}
