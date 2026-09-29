import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Group, MathUtils } from 'three';
import { colors } from '../../ui/theme';
import { Point } from '../grass/coverage';
import { SceneController, SceneFrame, worldPoint } from '../three/SceneFrame';
import { RoundedBoard } from '../three/RoundedBoard';
import { GameProps } from '../types';
import { SAND_PATHS, SandProgress, endSand, moveSand, startSand } from './rules';
import { Arrival, CompletionDolly, SoftBox, StudioLight } from '../three/Diorama';
import { ZenEnvironment } from './ZenEnvironment';
import { ToolParticles } from '../three/ToolParticles';

const MAX_SEGMENTS = 1200;

function makeGrooves() {
  const geometry = new BufferGeometry();
  const positions = new Float32Array(MAX_SEGMENTS * 5 * 2 * 3);
  const attribute = new BufferAttribute(positions, 3).setUsage(DynamicDrawUsage);
  geometry.setAttribute('position', attribute);
  geometry.setDrawRange(0, 0);
  return { geometry, positions, attribute, next: 0, count: 0 };
}

type Grooves = ReturnType<typeof makeGrooves>;

function addGroove(grooves: Grooves, a: Point, b: Point) {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (length < 0.5) return;
  const nx = -(b.y - a.y) / length;
  const ny = (b.x - a.x) / length;
  const slot = grooves.next % MAX_SEGMENTS;
  for (let i = 0; i < 5; i++) {
    const offset = (i - 2) * 6;
    const start = worldPoint({ x: a.x + nx * offset, y: a.y + ny * offset }, -0.155);
    const end = worldPoint({ x: b.x + nx * offset, y: b.y + ny * offset }, -0.155);
    grooves.positions.set(start, (slot * 5 + i) * 6);
    grooves.positions.set(end, (slot * 5 + i) * 6 + 3);
  }
  grooves.next++;
  grooves.count = Math.min(MAX_SEGMENTS, grooves.count + 1);
  grooves.geometry.setDrawRange(0, grooves.count * 10);
  grooves.attribute.needsUpdate = true;
}

function Rake({ pointer, moving, reducedMotion }: { pointer: Point; moving: boolean; reducedMotion: boolean }) {
  const model = useRef<Group>(null);
  const [x, , z] = worldPoint(pointer);
  useFrame((_, delta) => {
    if (!model.current) return;
    const t = Math.min(delta, 0.05);
    model.current.position.x = MathUtils.damp(model.current.position.x, x, reducedMotion ? 40 : 26, t);
    model.current.position.z = MathUtils.damp(model.current.position.z, z, reducedMotion ? 40 : 26, t);
    model.current.rotation.x = MathUtils.damp(model.current.rotation.x, moving ? -0.1 : 0.07, 6, t);
    model.current.position.y = MathUtils.damp(model.current.position.y, moving ? -0.09 : 0.01, 9, t);
  });
  const [startX, , startZ] = worldPoint({ x: 160, y: 350 });
  return <group ref={model} position={[startX, 0.01, startZ]}>
    <mesh position={[0, 0.45, 0.24]} rotation={[0.66, 0, 0]} scale={[0.09, 1.05, 0.09]}><cylinderGeometry args={[1, 1, 1, 8]} /><meshStandardMaterial color="#9E704F" roughness={0.88} /></mesh>
    <SoftBox position={[0, .13, -.3]} size={[1.12, .18, .22]} color="#B1845D" radius={.06} />
    {[-0.4, -0.2, 0, 0.2, 0.4].map((px) => <mesh key={px} position={[px, 0.04, -0.42]} rotation={[0.22, 0, 0]} scale={[0.065, 0.16, 0.32]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#9C6D4E" roughness={0.9} /></mesh>)}
    <mesh position={[0, 0.99, 0.63]} scale={[0.16, 0.2, 0.15]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#D9B07E" roughness={0.8} /></mesh>
  </group>;
}

function SandScene({ grooves, pointer, moving, variation, reducedMotion, complete }: {
  grooves: Grooves; pointer: Point; moving: boolean; variation: number; reducedMotion: boolean; complete: boolean;
}) {
  const tone = ['#E9D0A5', '#E8C7AF', '#DDC48F'][variation % 3]!;
  return <>
    <StudioLight />
    <Arrival reducedMotion={reducedMotion}><ZenEnvironment reducedMotion={reducedMotion} complete={complete} /></Arrival>
    <RoundedBoard width={8.2} depth={10.6} height={0.32} position={[0, -0.43, 0]} color="#B98D67" />
    <RoundedBoard width={7.85} depth={10.25} height={0.12} position={[0, -0.23, 0]} color={tone} roughness={1} />
    <lineSegments geometry={grooves.geometry} frustumCulled={false}><lineBasicMaterial color="#A98968" /></lineSegments>
    <group position={[0, 0.003, 0.035]}><lineSegments geometry={grooves.geometry} frustumCulled={false}><lineBasicMaterial color="#FFF0CC" /></lineSegments></group>
    {[-1, 1].map((side) => <group key={side} position={[side * 3.18, 0, -3.8]}>
      {[0, 1, 2].map((i) => <mesh key={i} position={[side * (i * 0.06), 0.03 + i * 0.08, i * 0.34]} scale={[0.35 - i * 0.04, 0.19, 0.27]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={i % 2 ? '#ABB2A1' : '#929B8B'} roughness={1} /></mesh>)}
    </group>)}
    <Rake pointer={pointer} moving={moving} reducedMotion={reducedMotion} />
    <ToolParticles point={pointer} active={moving && !complete} reducedMotion={reducedMotion} color="#DDC495" height={.03} />
    <CompletionDolly complete={complete} reducedMotion={reducedMotion} amount={1.8} />
  </>;
}

export const SandGame3D = memo(function SandGame3D(props: GameProps) {
  const controller = useMemo<SceneController>(() => ({ camera: null }), []);
  const grooves = useMemo(makeGrooves, []);
  const progress = useRef<SandProgress>({ start: { x: 0, y: 0 }, extent: 0, count: 0 });
  const previous = useRef<Point | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pointer, setPointer] = useState<Point>({ x: 160, y: 350 });
  const [moving, setMoving] = useState(false);
  const [complete, setComplete] = useState(false);
  useEffect(() => () => { grooves.geometry.dispose(); if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller, grooves]);
  const move = (point: Point, start: boolean) => {
    if (complete) return;
    if (start || !previous.current) {
      startSand(progress.current, point);
      previous.current = point;
      setPointer(point);
      setMoving(true);
      return;
    }
    moveSand(progress.current, point);
    addGroove(grooves, previous.current, point);
    previous.current = point;
    setPointer(point);
  };
  const release = (_point: Point | null, success: boolean) => {
    if (!previous.current) return;
    const before = progress.current.count;
    endSand(progress.current, success);
    previous.current = null;
    setMoving(false);
    if (props.mode === 'free' || before === progress.current.count) return;
    props.onProgress(Math.floor(progress.current.count / SAND_PATHS * 100));
    if (progress.current.count === SAND_PATHS) { setComplete(true); timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 750); }
  };
  return <SceneFrame controller={controller} enabled={props.enabled} background={colors.background} cameraPosition={[3.2, 14, 11.5]} fov={51} label="Jardim de areia 3D com ancinho de cinco dentes. Trace quatro caminhos amplos, soltando o dedo entre eles." onPoint={move} onRelease={release} onEnd={() => { if (previous.current) release(null, false); }}>
    <SandScene grooves={grooves} pointer={pointer} moving={moving} variation={props.variation} reducedMotion={props.reducedMotion} complete={complete} />
  </SceneFrame>;
});
