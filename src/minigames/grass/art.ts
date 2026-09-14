import { Skia } from '@shopify/react-native-skia';
import { GrassConfig } from '../../trail/stages';
import { FIELD_HEIGHT, FIELD_WIDTH } from './coverage';

// Geometria criada uma vez por variação: centenas de folhas em apenas dois paths.
export function makeGrassArt(variation: GrassConfig['variation']) {
  const blades = Skia.Path.Make();
  const highlights = Skia.Path.Make();
  const pattern = Skia.Path.Make();
  for (let row = 0; row < 36; row++) {
    for (let col = 0; col < 26; col++) {
      const seed = (row * 37 + col * 19) % 17;
      const x = col * 13 + (row % 2) * 6 + (seed % 4);
      const y = row * 13 + (seed % 5);
      blades
        .moveTo(x - 2, y + 6)
        .lineTo(x, y)
        .lineTo(x + 3, y + 5);
      if (seed % 3 === 0) highlights.moveTo(x + 4, y + 7).lineTo(x + 6, y + 2);
    }
  }
  for (let y = 0; y < FIELD_HEIGHT; y += 64) {
    if (variation === 'patchwork') {
      for (let x = 0; x < FIELD_WIDTH; x += 64) {
        if ((x / 64 + y / 64) % 2 === 0)
          pattern.addRect({ x, y, width: 64, height: 64 });
      }
    } else if (variation === 'bands') {
      pattern.addRect({ x: 0, y, width: FIELD_WIDTH, height: 32 });
    } else {
      pattern.addRect({
        x: y % FIELD_WIDTH,
        y: 0,
        width: 26,
        height: FIELD_HEIGHT,
      });
    }
  }
  return { blades, highlights, pattern };
}
