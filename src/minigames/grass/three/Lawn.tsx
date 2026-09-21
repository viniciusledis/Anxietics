import { useFrame } from '@react-three/fiber/native';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedMesh,
  Object3D,
} from 'three';
import { GrassPalette } from '../../../trail/stages';
import { LawnController } from './LawnController';
import {
  LAWN_DEPTH,
  LAWN_WIDTH,
  SURFACE_Y,
  TILE_COLUMNS,
  TILE_ROWS,
  TILES,
  TUFT_COLUMNS,
  TUFT_ROWS,
  TUFTS,
} from './sceneModel';

const tileDummy = new Object3D();
const tuftDummy = new Object3D();

function makeBladeGeometry() {
  const positions: number[] = [];
  for (let leaf = 0; leaf < 3; leaf++) {
    const angle = (leaf / 3) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dz = Math.sin(angle);
    const sideX = -dz;
    const sideZ = dx;
    const baseX = dx * 0.018;
    const baseZ = dz * 0.018;
    const midX = dx * 0.052;
    const midZ = dz * 0.052;
    const tipX = dx * 0.105;
    const tipZ = dz * 0.105;
    const halfWidth = 0.03;
    positions.push(
      baseX - sideX * halfWidth, 0, baseZ - sideZ * halfWidth,
      baseX + sideX * halfWidth, 0, baseZ + sideZ * halfWidth,
      midX + sideX * 0.045, 0.15, midZ + sideZ * 0.045,
      baseX - sideX * halfWidth, 0, baseZ - sideZ * halfWidth,
      midX + sideX * 0.045, 0.15, midZ + sideZ * 0.045,
      midX - sideX * 0.045, 0.15, midZ - sideZ * 0.045,
      midX - sideX * 0.045, 0.15, midZ - sideZ * 0.045,
      midX + sideX * 0.045, 0.15, midZ + sideZ * 0.045,
      tipX, 0.25 + leaf * 0.018, tipZ,
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function tuftPosition(index: number) {
  const col = index % TUFT_COLUMNS;
  const row = Math.floor(index / TUFT_COLUMNS);
  const jitter = ((row * 17 + col * 11) % 7 - 3) * 0.006;
  return {
    x: -LAWN_WIDTH / 2 + (col + 0.5) * (LAWN_WIDTH / TUFT_COLUMNS) + jitter,
    z: -LAWN_DEPTH / 2 + (row + 0.5) * (LAWN_DEPTH / TUFT_ROWS) - jitter,
  };
}

function setTuft(mesh: InstancedMesh, index: number, cut: number) {
  const { x, z } = tuftPosition(index);
  const variety = ((index * 23) % 11) / 11;
  tuftDummy.position.set(x, SURFACE_Y + 0.006, z);
  tuftDummy.rotation.set(0, variety * Math.PI * 2, 0);
  tuftDummy.scale.set(
    0.76 + variety * 0.38,
    Math.max(0.025, 0.87 + variety * 0.22 - cut * 0.93),
    0.76 + variety * 0.38,
  );
  tuftDummy.updateMatrix();
  mesh.setMatrixAt(index, tuftDummy.matrix);
}

export function Lawn({
  controller,
  palette,
  reducedMotion,
}: {
  controller: LawnController;
  palette: GrassPalette;
  reducedMotion: boolean;
}) {
  const tiles = useRef<InstancedMesh>(null);
  const tufts = useRef<InstancedMesh>(null);
  const tileValues = useMemo(() => new Float32Array(TILES), []);
  const tuftValues = useMemo(() => new Float32Array(TUFTS), []);
  const bladeGeometry = useMemo(makeBladeGeometry, []);
  const tallColor = useMemo(() => new Color(palette.tall), [palette.tall]);
  const cutColor = useMemo(() => new Color(palette.cut), [palette.cut]);
  const stripeColor = useMemo(() => new Color(palette.stripe), [palette.stripe]);
  const bladeColor = useMemo(() => new Color(palette.highlight), [palette.highlight]);
  const darkBlade = useMemo(() => new Color(palette.blade), [palette.blade]);
  const tileColor = useMemo(() => new Color(), []);

  useLayoutEffect(() => {
    if (!tiles.current || !tufts.current) return;
    for (let row = 0; row < TILE_ROWS; row++) {
      for (let col = 0; col < TILE_COLUMNS; col++) {
        const index = row * TILE_COLUMNS + col;
        tileDummy.position.set(
          -LAWN_WIDTH / 2 + (col + 0.5) * (LAWN_WIDTH / TILE_COLUMNS),
          SURFACE_Y + 0.002,
          -LAWN_DEPTH / 2 + (row + 0.5) * (LAWN_DEPTH / TILE_ROWS),
        );
        tileDummy.rotation.set(-Math.PI / 2, 0, 0);
        tileDummy.scale.set(1, 1, 1);
        tileDummy.updateMatrix();
        tiles.current.setMatrixAt(index, tileDummy.matrix);
        const variation = ((col * 5 + row * 7) % 9) * 0.007;
        tiles.current.setColorAt(
          index,
          tileColor.copy(tallColor).lerp(bladeColor, 0.09 + variation),
        );
      }
    }
    for (let index = 0; index < TUFTS; index++) {
      setTuft(tufts.current, index, 0);
      const variation = ((index * 31) % 9) / 20;
      tufts.current.setColorAt(
        index,
        tileColor.copy(darkBlade).lerp(bladeColor, 0.59 + variation),
      );
    }
    tiles.current.instanceMatrix.needsUpdate = true;
    tiles.current.instanceColor!.needsUpdate = true;
    tufts.current.instanceMatrix.needsUpdate = true;
    tufts.current.instanceColor!.needsUpdate = true;
    tiles.current.computeBoundingSphere();
    tufts.current.computeBoundingSphere();
    return () => bladeGeometry.dispose();
  }, [bladeGeometry, bladeColor, darkBlade, tallColor, tileColor]);

  useFrame((_, delta) => {
    const tileMesh = tiles.current;
    const tuftMesh = tufts.current;
    if (!tileMesh || !tuftMesh) return;
    const factor = reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 13);
    let tileDirty = false;
    for (const index of controller.activeTiles) {
      const target = controller.tileTargets[index]!;
      const current = tileValues[index]!;
      const next = Math.abs(target - current) < 0.012
        ? target
        : current + (target - current) * factor;
      tileValues[index] = next;
      const row = Math.floor(index / TILE_COLUMNS);
      const targetColor = row % 8 < 4 ? cutColor : stripeColor;
      const variation = ((index * 13) % 9) * 0.007;
      tileMesh.setColorAt(
        index,
        tileColor.copy(tallColor).lerp(bladeColor, 0.09 + variation).lerp(targetColor, next),
      );
      tileDirty = true;
      if (next === target) controller.activeTiles.delete(index);
    }
    if (tileDirty) tileMesh.instanceColor!.needsUpdate = true;

    let tuftDirty = false;
    for (const index of controller.activeTufts) {
      const target = controller.tuftTargets[index]!;
      const current = tuftValues[index]!;
      const next = Math.abs(target - current) < 0.012
        ? target
        : current + (target - current) * factor;
      tuftValues[index] = next;
      setTuft(tuftMesh, index, next);
      tuftDirty = true;
      if (next === target) controller.activeTufts.delete(index);
    }
    if (tuftDirty) tuftMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={tiles} args={[undefined, undefined, TILES]} frustumCulled={false}>
        <planeGeometry args={[LAWN_WIDTH / TILE_COLUMNS + 0.002, LAWN_DEPTH / TILE_ROWS + 0.002]} />
        <meshStandardMaterial roughness={1} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={tufts} args={[bladeGeometry, undefined, TUFTS]} frustumCulled={false}>
        <meshStandardMaterial side={DoubleSide} roughness={0.88} metalness={0} flatShading />
      </instancedMesh>
    </>
  );
}
