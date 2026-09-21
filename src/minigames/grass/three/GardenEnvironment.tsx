import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Object3D,
  SphereGeometry,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GrassPalette } from '../../../trail/stages';

type Decor = {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  color?: string;
  angle?: number;
};

const dummy = new Object3D();
const tint = new Color();

function Batch({
  geometry,
  items,
  baseColor,
  roughness = 0.9,
}: {
  geometry: SphereGeometry | BoxGeometry | CylinderGeometry;
  items: Decor[];
  baseColor: string;
  roughness?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    items.forEach((item, index) => {
      dummy.position.set(item.x, item.y, item.z);
      dummy.rotation.set(0, item.angle ?? 0, 0);
      dummy.scale.set(item.sx, item.sy, item.sz);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(index, dummy.matrix);
      mesh.current!.setColorAt(index, tint.set(item.color ?? baseColor));
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor!.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [items, baseColor]);
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, items.length]} frustumCulled={false}>
      <meshStandardMaterial roughness={roughness} metalness={0} />
    </instancedMesh>
  );
}

const FLOWER_SPOTS = [
  [-2.19, -2.28], [-2.15, -1.15], [-2.16, 0.7], [-2.12, 2.15],
  [2.18, -2.34], [2.17, -1.04], [2.13, 0.86], [2.11, 2.31],
  [-1.38, -3.06], [0.74, -3.05], [1.62, -3.01],
] as const;

export function GardenEnvironment({ palette }: { palette: GrassPalette }) {
  const roundedBase = useMemo(() => new RoundedBoxGeometry(4.78, 0.46, 6.38, 4, 0.2), []);
  const roundedTop = useMemo(() => new RoundedBoxGeometry(4.3, 0.18, 5.9, 4, 0.12), []);
  const sphere = useMemo(() => new SphereGeometry(1, 12, 8), []);
  const box = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const cylinder = useMemo(() => new CylinderGeometry(1, 1, 1, 7), []);

  const stones = useMemo<Decor[]>(() => [
    { x: -2.31, y: 0.08, z: 1.14, sx: 0.19, sy: 0.09, sz: 0.15, color: '#D8C6AA' },
    { x: -2.28, y: 0.08, z: 1.44, sx: 0.13, sy: 0.07, sz: 0.12, color: '#B9B9A1' },
    { x: 2.29, y: 0.08, z: -0.18, sx: 0.18, sy: 0.09, sz: 0.16, color: '#DED1B8' },
    { x: 2.27, y: 0.08, z: 0.1, sx: 0.13, sy: 0.07, sz: 0.14, color: '#B5B7A0' },
    { x: 1.69, y: 0.08, z: -3.03, sx: 0.18, sy: 0.07, sz: 0.11, color: '#D5C3A7' },
    { x: 1.94, y: 0.08, z: -2.98, sx: 0.12, sy: 0.05, sz: 0.12, color: '#E8DDC7' },
  ], []);
  const bushes = useMemo<Decor[]>(() => [
    [-2.31, -2.85, 0.31], [-2.12, -2.98, 0.26], [-2.31, -2.28, 0.24],
    [2.25, -2.84, 0.35], [2.35, -2.35, 0.29], [2.32, 1.9, 0.25],
    [-2.34, 2.7, 0.3], [2.28, 2.72, 0.28], [-2.29, -0.2, 0.19],
  ].map(([x, z, size], index) => ({
    x: x!, y: 0.16 + size! * 0.45, z: z!,
    sx: size! * 1.25, sy: size!, sz: size!,
    color: index % 3 === 0 ? '#5D854E' : index % 3 === 1 ? '#729B5D' : '#456F4D',
  })), []);
  const fencePosts = useMemo<Decor[]>(() => Array.from({ length: 9 }, (_, i) => ({
    x: -1.82 + i * 0.455, y: 0.4, z: -3.08,
    sx: 0.115, sy: 0.72, sz: 0.13,
    color: i % 2 ? '#EED9B4' : '#F5E5C8',
  })), []);
  const flowerPetals = useMemo<Decor[]>(() => FLOWER_SPOTS.flatMap(([x, z], flower) =>
    Array.from({ length: 5 }, (_, petal) => {
      const angle = (petal / 5) * Math.PI * 2;
      return {
        x: x + Math.cos(angle) * 0.085,
        y: 0.28 + Math.sin(flower * 2.2) * 0.03,
        z: z + Math.sin(angle) * 0.085,
        sx: 0.077, sy: 0.037, sz: 0.05,
        angle: -angle,
        color: flower % 3 === 0 ? '#FFF8DF' : flower % 3 === 1 ? '#EBA894' : '#F5D685',
      };
    }),
  ), []);
  const flowerCenters = useMemo<Decor[]>(() => FLOWER_SPOTS.map(([x, z]) => ({
    x, y: 0.31, z, sx: 0.05, sy: 0.045, sz: 0.05, color: '#E8B45D',
  })), []);
  const flowerLeaves = useMemo<Decor[]>(() => FLOWER_SPOTS.flatMap(([x, z]) => [
    { x: x - 0.07, y: 0.19, z: z + 0.04, sx: 0.11, sy: 0.045, sz: 0.055, color: '#6C9B57' },
    { x: x + 0.07, y: 0.19, z: z - 0.04, sx: 0.11, sy: 0.045, sz: 0.055, color: '#4C7D4D' },
  ]), []);
  const canopyLeaves = useMemo<Decor[]>(() => Array.from({ length: 28 }, (_, i) => {
    const angle = i * 2.399963;
    const ring = Math.sqrt((i + 0.5) / 28);
    return {
      x: -2.28 + Math.cos(angle) * ring * 0.52,
      y: 1.12 + Math.sin(i * 5.2) * 0.21,
      z: -2.57 + Math.sin(angle) * ring * 0.44,
      sx: 0.16, sy: 0.11, sz: 0.12,
      color: i % 3 === 0 ? '#86AD5F' : i % 3 === 1 ? '#568947' : '#6A9C50',
    };
  }), []);

  return (
    <group>
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.7, 3.7, 1]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#786C4F" transparent opacity={0.13} depthWrite={false} />
      </mesh>
      <mesh geometry={roundedBase} position={[0, -0.2, 0]}>
        <meshStandardMaterial color="#AA8366" roughness={1} />
      </mesh>
      <mesh geometry={roundedTop} position={[0, 0.065, 0]}>
        <meshStandardMaterial color={palette.cut} roughness={0.95} />
      </mesh>
      <Batch geometry={sphere} items={stones} baseColor="#D9C6A9" />
      <Batch geometry={sphere} items={bushes} baseColor="#628C55" />
      <Batch geometry={box} items={fencePosts} baseColor="#F5E5C8" />
      <mesh position={[0, 0.31, -3.09]}>
        <boxGeometry args={[3.98, 0.11, 0.11]} />
        <meshStandardMaterial color="#D8BC94" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.54, -3.09]}>
        <boxGeometry args={[3.98, 0.09, 0.11]} />
        <meshStandardMaterial color="#E8D0A8" roughness={0.95} />
      </mesh>
      <group position={[-2.28, 0, -2.57]}>
        <mesh position={[0, 0.49, 0]}>
          <cylinderGeometry args={[0.14, 0.2, 0.92, 7]} />
          <meshStandardMaterial color="#9E7653" roughness={1} />
        </mesh>
        <mesh position={[0, 1.11, 0]} scale={[0.59, 0.62, 0.56]}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#497A45" roughness={1} />
        </mesh>
        <mesh position={[-0.31, 0.98, 0.05]} scale={[0.35, 0.38, 0.35]}>
          <sphereGeometry args={[1, 9, 7]} />
          <meshStandardMaterial color="#5D914F" roughness={1} />
        </mesh>
        <mesh position={[0.28, 1.02, 0.08]} scale={[0.39, 0.43, 0.38]}>
          <sphereGeometry args={[1, 9, 7]} />
          <meshStandardMaterial color="#73A45A" roughness={1} />
        </mesh>
      </group>
      <Batch geometry={sphere} items={canopyLeaves} baseColor="#6A9C50" />
      <Batch geometry={sphere} items={flowerLeaves} baseColor="#6C9B57" />
      <Batch geometry={sphere} items={flowerPetals} baseColor="#FFF8DF" />
      <Batch geometry={sphere} items={flowerCenters} baseColor="#E8B45D" />
    </group>
  );
}
