import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Color, InstancedMesh, Object3D } from 'three';
import { colors } from '../../ui/theme';
import { Point } from '../grass/coverage';
import { SceneController, SceneFrame, worldPoint } from '../three/SceneFrame';
import { RoundedBoard } from '../three/RoundedBoard';
import { GameProps } from '../types';
import { FLOWER_LIMIT, FLOWERS_PER_REGION, FlowerState, REGIONS, createFlowers, flowerPoint, plantSegment } from './rules';
import { Arrival, FinishDust, Pebble, StudioLight } from '../three/Diorama';
import { NurseryEnvironment } from './NurseryEnvironment';

type GardenController = SceneController & { planted: number[]; growth: number[] };
const blooms = [
  ['#D88AA0', '#E6A0A9', '#C6849F'],
  ['#F6F0D8', '#FFF7E8', '#EEE4C7'],
  ['#A997C6', '#BBA6D0', '#9F8CBB'],
];

function FlowerInstances({ controller, reducedMotion, variation }: { controller: GardenController; reducedMotion: boolean; variation: number }) {
  const stems = useRef<InstancedMesh>(null);
  const leaves = useRef<InstancedMesh>(null);
  const petals = useRef<InstancedMesh>(null);
  const centers = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const seen = useRef(0);
  useEffect(() => {
    if (stems.current) stems.current.count = 0;
    if (leaves.current) leaves.current.count = 0;
    if (petals.current) petals.current.count = 0;
    if (centers.current) centers.current.count = 0;
  }, []);
  useFrame(({ clock }, delta) => {
    const stem = stems.current;
    const leaf = leaves.current;
    const petal = petals.current;
    const center = centers.current;
    if (!stem || !leaf || !petal || !center) return;
    const count = controller.planted.length;
    if (count !== seen.current) {
      for (let slot = seen.current; slot < count; slot++) {
        const palette = blooms[variation % blooms.length]!;
        for (let p = 0; p < 6; p++) petal.setColorAt(slot * 6 + p, new Color(palette[controller.planted[slot]! % palette.length]!));
        controller.growth[slot] = reducedMotion ? 1 : 0.02;
      }
      seen.current = count;
      stem.count = leaf.count = center.count = count;
      petal.count = count * 6;
      if (petal.instanceColor) petal.instanceColor.needsUpdate = true;
    }
    let changed = false;
    for (let slot = 0; slot < count; slot++) {
      const old = controller.growth[slot]!;
      const growth = Math.min(1, old + delta * (reducedMotion ? 20 : 3.3));
      controller.growth[slot] = growth;
      const [x, , z] = worldPoint(flowerPoint(controller.planted[slot]!));
      const height = .55 + (slot % 4) * .06;
      const sway = reducedMotion ? 0 : Math.sin(clock.elapsedTime * 1.2 + x + z) * .035;
      dummy.position.set(x, height * .45 * growth, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.038, height * .9 * growth, 0.038);
      dummy.updateMatrix(); stem.setMatrixAt(slot, dummy.matrix);
      dummy.position.set(x + 0.1, 0.13 * growth, z + 0.02);
      dummy.rotation.set(0, 0.45, -0.4);
      dummy.scale.set(0.16 * growth, 0.055 * growth, 0.09 * growth);
      dummy.updateMatrix(); leaf.setMatrixAt(slot, dummy.matrix);
      for (let p = 0; p < 6; p++) {
        const a = p * Math.PI / 3 + slot * .7;
        dummy.position.set(x + sway + Math.cos(a) * .12 * growth, height * growth, z + Math.sin(a) * .12 * growth);
        dummy.rotation.set(0, -a, .15);
        dummy.scale.set(.15 * growth, .065 * growth, .085 * growth);
        dummy.updateMatrix(); petal.setMatrixAt(slot * 6 + p, dummy.matrix);
      }
      dummy.position.set(x + sway, (height + .04) * growth, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.07 * growth);
      dummy.updateMatrix(); center.setMatrixAt(slot, dummy.matrix);
      changed = true;
    }
    if (changed) {
      stem.instanceMatrix.needsUpdate = true;
      leaf.instanceMatrix.needsUpdate = true;
      petal.instanceMatrix.needsUpdate = true;
      center.instanceMatrix.needsUpdate = true;
    }
  });
  return <>
    <instancedMesh ref={stems} args={[undefined, undefined, FLOWER_LIMIT]} frustumCulled={false}><cylinderGeometry args={[1, 1, 1, 5]} /><meshStandardMaterial color="#609160" roughness={0.96} /></instancedMesh>
    <instancedMesh ref={leaves} args={[undefined, undefined, FLOWER_LIMIT]} frustumCulled={false}><sphereGeometry args={[1, 7, 5]} /><meshStandardMaterial color="#77A36A" roughness={0.96} /></instancedMesh>
    <instancedMesh ref={petals} args={[undefined, undefined, FLOWER_LIMIT * 6]} frustumCulled={false} castShadow><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#FFFFFF" roughness={0.65} /></instancedMesh>
    <instancedMesh ref={centers} args={[undefined, undefined, FLOWER_LIMIT]} frustumCulled={false}><sphereGeometry args={[1, 6, 5]} /><meshStandardMaterial color="#E8BF61" roughness={0.85} /></instancedMesh>
  </>;
}

function FlowerScene({ controller, reducedMotion, variation, completedRegions, complete }: { controller: GardenController; reducedMotion: boolean; variation: number; completedRegions: boolean[]; complete: boolean }) {
  return <>
    <StudioLight />
    <Arrival reducedMotion={reducedMotion}><NurseryEnvironment reducedMotion={reducedMotion} /></Arrival>
    <RoundedBoard width={8.5} depth={10.7} height={0.34} position={[0, -0.42, 0]} color="#B98C67" />
    <RoundedBoard width={8.05} depth={10.25} height={0.1} position={[0, -0.22, 0]} color="#E9DFC7" roughness={1} />
    {REGIONS.map((region, i) => {
      const [x, , z] = worldPoint(region);
      return <group key={i} position={[x, -0.08, z]}>
        {Array.from({ length: 16 }, (_, j) => <Pebble key={j} position={[Math.cos(j * Math.PI / 8) * 1.42, .075, Math.sin(j * Math.PI / 8) * 1.52]} scale={[.2, .12, .17]} rotation={[0, -j * Math.PI / 8, 0]} color={j % 3 ? '#B8BBA0' : '#D8C7AA'} />)}
        <mesh scale={[1.5, 0.1, 1.6]}><cylinderGeometry args={[1, 1, 1, 24]} /><meshStandardMaterial color="#A7B987" roughness={1} /></mesh>
        <mesh position={[0, 0.04, 0]} scale={[1.33, 0.04, 1.42]}><cylinderGeometry args={[1, 1, 1, 24]} /><meshStandardMaterial color="#6F955F" roughness={1} /></mesh>
        <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.28, 0.035, 4, 24]} /><meshStandardMaterial color={completedRegions[i] ? '#E8C66B' : '#D4CBA5'} roughness={0.95} /></mesh>
      </group>;
    })}
    <FlowerInstances controller={controller} reducedMotion={reducedMotion} variation={variation} />
    {complete && <FinishDust color={blooms[variation % 3]![0]!} reducedMotion={reducedMotion} />}
  </>;
}

export const FlowersGame3D = memo(function FlowersGame3D(props: GameProps) {
  const controller = useMemo<GardenController>(() => ({ camera: null, planted: [], growth: [] }), []);
  const flowerState = useMemo<FlowerState>(createFlowers, []);
  const previous = useRef<Point | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [complete, setComplete] = useState(false);
  const [completedRegions, setCompletedRegions] = useState([false, false, false, false]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller]);
  const move = (point: Point, start: boolean) => {
    if (complete) return;
    const from = start || !previous.current ? point : previous.current;
    previous.current = point;
    const changed = plantSegment(flowerState, from, point);
    if (!changed.length) return;
    controller.planted.push(...changed);
    if (flowerState.regions.some((count, i) => count >= FLOWERS_PER_REGION && !completedRegions[i]))
      setCompletedRegions(flowerState.regions.map((count) => count >= FLOWERS_PER_REGION));
    if (props.mode === 'free') return;
    const total = flowerState.regions.reduce((a, b) => a + b, 0);
    props.onProgress(Math.floor(total / (REGIONS.length * FLOWERS_PER_REGION) * 100));
    if (total === REGIONS.length * FLOWERS_PER_REGION) {
      setComplete(true);
      timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 900);
    }
  };
  return <SceneFrame controller={controller} enabled={props.enabled} background={colors.background} cameraPosition={[3, 14.5, 11]} fov={52} label="Quatro canteiros de flores em 3D. Arraste para plantar oito flores em cada região." onPoint={move} onEnd={() => { previous.current = null; }}>
    <FlowerScene controller={controller} reducedMotion={props.reducedMotion} variation={props.variation} completedRegions={completedRegions} complete={complete} />
  </SceneFrame>;
});
