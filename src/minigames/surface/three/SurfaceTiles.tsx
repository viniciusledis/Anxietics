import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Color, DataTexture, LinearFilter, PlaneGeometry, RGBAFormat, SRGBColorSpace } from 'three';
import { GAME_INFO } from '../../definitions';
import { COLUMNS, Coverage, TOTAL_CELLS } from '../../grass/coverage';
import { GameId } from '../../types';
import { completionResidue } from './visualCompletion';

export type SurfaceController = {
  camera: import('three').Camera | null;
  coverage: Coverage;
  changes: { index: number; color: number }[];
};
const topColors: Record<string, string> = {
  window: '#DDEBE9', wash: '#A18B65', paint: '#E7E0D0', reveal: '#CEBB96', clay: '#C6977E',
};
const ROWS = TOTAL_CELLS / COLUMNS;
function heightAt(game: GameId, x: number, z: number) {
  if (game === 'wash') return z < -1.15 ? .57 : .26 + .65 * Math.sqrt(Math.max(.02, 1 - (x / 2.09) ** 2 - ((z - .9) / 2.48) ** 2));
  if (game === 'clay') return .27 + .07 * (1 + Math.sin(x * 5 + Math.sin(z * 2)) * Math.cos(z * 4));
  return game === 'window' ? .32 : game === 'paint' ? .035 : .31;
}

/** A continuous sculpted skin. GPU masks are a view of the unchanged coverage grid. */
export function SurfaceTiles({ controller, game, reducedMotion }: { controller: SurfaceController; game: GameId; reducedMotion: boolean }) {
  const seen = useRef(0);
  const fading = useRef(new Set<number>());
  const finished = useRef(false);
  const resources = useMemo(() => {
    const geometry = new PlaneGeometry(6.4, 8.96, COLUMNS, ROWS);
    geometry.rotateX(-Math.PI / 2);
    const positions = geometry.attributes.position!;
    for (let i = 0; i < positions.count; i++) positions.setY(i, heightAt(game, positions.getX(i), positions.getZ(i)));
    geometry.computeVertexNormals();
    const mask = new Uint8Array(TOTAL_CELLS * 4);
    const pixels = new Uint8Array(TOTAL_CELLS * 4);
    const base = new Color(topColors[game]!).convertLinearToSRGB();
    const offsets = new Int32Array(TOTAL_CELLS);
    for (let i = 0; i < TOTAL_CELLS; i++) {
      const row = Math.floor(i / COLUMNS), col = i % COLUMNS;
      const offset = ((ROWS - 1 - row) * COLUMNS + col) * 4;
      offsets[i] = offset;
      const value = controller.coverage.eligible[i] ? 255 : 0;
      mask.set([value, value, value, 255], offset);
      const tone = .98 + Math.sin(col * .13) * Math.cos(row * .09) * .02;
      pixels.set([base.r * 255 * tone, base.g * 255 * tone, base.b * 255 * tone, 255], offset);
    }
    const alpha = new DataTexture(mask, COLUMNS, ROWS, RGBAFormat);
    const color = new DataTexture(pixels, COLUMNS, ROWS, RGBAFormat);
    for (const texture of [alpha, color]) { texture.minFilter = texture.magFilter = LinearFilter; texture.generateMipmaps = false; texture.needsUpdate = true; }
    color.colorSpace = SRGBColorSpace;
    return { geometry, mask, pixels, offsets, alpha, color };
  }, [controller, game]);
  useEffect(() => () => { resources.geometry.dispose(); resources.alpha.dispose(); resources.color.dispose(); }, [resources]);
  const shade = useMemo(() => new Color(), []);
  useFrame((_, delta) => {
    let changed = false;
    for (let i = seen.current; i < controller.changes.length; i++) {
      const change = controller.changes[i]!;
      if (game === 'paint') {
        shade.set(GAME_INFO.paint.colors![change.color]!).convertLinearToSRGB();
        resources.pixels.set([shade.r * 255, shade.g * 255, shade.b * 255, 255], resources.offsets[change.index]!);
        changed = true;
      } else fading.current.add(change.index);
    }
    seen.current = controller.changes.length;
    if (controller.coverage.completed && !finished.current) {
      finished.current = true;
      const residue = completionResidue(controller.coverage);
      if (game === 'paint') {
        const lastColor = controller.changes[controller.changes.length - 1]?.color ?? 0;
        shade.set(GAME_INFO.paint.colors![lastColor]!).convertLinearToSRGB();
        for (const index of residue) resources.pixels.set([shade.r * 255, shade.g * 255, shade.b * 255, 255], resources.offsets[index]!);
        changed = residue.length > 0 || changed;
      } else for (const index of residue) fading.current.add(index);
    }
    if (changed) resources.color.needsUpdate = true;
    if (fading.current.size) {
      for (const index of fading.current) {
        const offset = resources.offsets[index]!;
        const alpha = Math.max(0, resources.mask[offset + 1]! - Math.ceil(delta * (reducedMotion ? 9000 : 2000)));
        resources.mask[offset] = resources.mask[offset + 1] = resources.mask[offset + 2] = alpha;
        if (!alpha) fading.current.delete(index);
      }
      resources.alpha.needsUpdate = true;
    }
  });
  return <mesh geometry={resources.geometry} receiveShadow renderOrder={1}>
    <meshStandardMaterial map={resources.color} alphaMap={resources.alpha} transparent alphaTest={.01} depthWrite={false} roughness={game === 'paint' ? .35 : game === 'window' ? .55 : .92} side={2} />
  </mesh>;
}
