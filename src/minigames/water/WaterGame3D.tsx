import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group, MathUtils } from 'three';
import { colors } from '../../ui/theme';
import { Point } from '../grass/coverage';
import { SceneController, SceneFrame, worldPoint } from '../three/SceneFrame';
import { RoundedBoard } from '../three/RoundedBoard';
import { GameProps } from '../types';
import { POTS, waterAt } from './rules';
import { Arrival, FinishDust, StudioLight, Vessel } from '../three/Diorama';
import { GreenhouseEnvironment } from './GreenhouseEnvironment';
import { ToolParticles } from '../three/ToolParticles';

const bloomColors = ['#E79B9C', '#E9C36E', '#BEA4C8'];

function Pot({ point, level, index, variation, reducedMotion }: { point: Point; level: number; index: number; variation: number; reducedMotion: boolean }) {
  const plant = useRef<Group>(null);
  const bloom = useRef<Group>(null);
  const [x, , z] = worldPoint(point);
  useFrame((_, delta) => {
    const growth = 0.3 + level * 0.95;
    const t = Math.min(delta, 0.05);
    if (plant.current) plant.current.scale.y = MathUtils.damp(plant.current.scale.y, growth, reducedMotion ? 40 : 4.5, t);
    if (bloom.current) bloom.current.scale.setScalar(MathUtils.damp(bloom.current.scale.x, level >= 0.98 ? 1 : level * 0.55, reducedMotion ? 35 : 5.5, t));
  });
  return <group position={[x, 0.07, z]}>
    <Vessel position={[0, -.22, 0]} scale={1.3} color={index % 2 ? '#C38F73' : '#D2A17E'} />
    <mesh position={[0.05, -0.15, 0.05]} scale={[0.77, 0.04, 0.58]}><sphereGeometry args={[1, 12, 8]} /><meshBasicMaterial color="#76715C" transparent opacity={0.16} depthWrite={false} /></mesh>
    <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.55, 0.41, 0.65, 18]} /><meshStandardMaterial color={index % 2 ? '#C38F73' : '#D2A17E'} roughness={0.93} /></mesh>
    <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.07, 6, 18]} /><meshStandardMaterial color="#E1B692" roughness={0.88} /></mesh>
    <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.48, 18]} /><meshStandardMaterial color="#6F624C" roughness={1} /></mesh>
    <group ref={plant} position={[0, 0.44, 0]} scale={[1, 0.3, 1]}>
      <mesh position={[0, 0.43, 0]} scale={[0.075, 0.86, 0.075]}><cylinderGeometry args={[1, 1, 1, 7]} /><meshStandardMaterial color="#5D8C5E" roughness={0.95} /></mesh>
      {[-1, 1].map((side) => <mesh key={side} position={[side * 0.21, 0.49, 0]} rotation={[0, 0, side * 0.48]} scale={[0.35, 0.09, 0.18]}><sphereGeometry args={[1, 10, 7]} /><meshStandardMaterial color={side > 0 ? '#7FAA72' : '#6E9F69'} roughness={0.94} /></mesh>)}
      <group ref={bloom} position={[0, 0.93, 0]} scale={[0.05, 0.05, 0.05]}>
        {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[Math.cos(i * Math.PI * 0.4) * 0.17, 0, Math.sin(i * Math.PI * 0.4) * 0.17]} scale={[0.15, 0.08, 0.21]} rotation={[0, i * Math.PI * 0.4, 0]}><sphereGeometry args={[1, 9, 6]} /><meshStandardMaterial color={bloomColors[variation % 3]} roughness={0.87} /></mesh>)}
        <mesh position={[0, 0.05, 0]} scale={[0.1, 0.07, 0.1]}><sphereGeometry args={[1, 9, 6]} /><meshStandardMaterial color="#F2D479" roughness={0.84} /></mesh>
      </group>
    </group>
    <mesh position={[0, -0.21, 0.61]} scale={[0.48 * level + 0.02, 0.035, 0.04]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#7EB1A8" roughness={0.75} /></mesh>
  </group>;
}

function WateringCan({ point, holding, reducedMotion }: { point: Point; holding: boolean; reducedMotion: boolean }) {
  const model = useRef<Group>(null);
  const [x, , z] = worldPoint(point);
  useFrame((_, delta) => {
    if (!model.current) return;
    const t = Math.min(delta, 0.05);
    model.current.position.x = MathUtils.damp(model.current.position.x, x, reducedMotion ? 40 : 23, t);
    model.current.position.z = MathUtils.damp(model.current.position.z, z, reducedMotion ? 40 : 23, t);
    model.current.rotation.z = MathUtils.damp(model.current.rotation.z, holding ? -0.18 : 0, 6, t);
    model.current.position.y = MathUtils.damp(model.current.position.y, holding ? 0.17 : 0.08, 6, t);
  });
  const [hx, , hz] = worldPoint({ x: 160, y: 390 });
  return <group ref={model} position={[hx, 0.08, hz]}><group position={[-1.2, .55, 0]}>
    <mesh position={[0.16, 0.34, 0]} rotation={[0, 0, -0.17]}><cylinderGeometry args={[0.42, 0.48, 0.58, 18]} /><meshStandardMaterial color="#78AFA8" roughness={0.73} /></mesh>
    <mesh position={[0.16, 0.67, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.38, 0.055, 6, 18]} /><meshStandardMaterial color="#9ACAC0" roughness={0.7} /></mesh>
    <mesh position={[0.83, 0.49, 0]} rotation={[0, 0, 1.1]} scale={[0.12, 0.87, 0.12]}><cylinderGeometry args={[1, 1, 1, 10]} /><meshStandardMaterial color="#79AAA8" roughness={0.75} /></mesh>
    <mesh position={[1.2, 0.26, 0]} rotation={[0, 0, 1.1]}><cylinderGeometry args={[0.17, 0.22, 0.1, 12]} /><meshStandardMaterial color="#B4D4C7" roughness={0.7} /></mesh>
    <mesh position={[-0.27, 0.48, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.31, 0.07, 7, 18, Math.PI * 1.4]} /><meshStandardMaterial color="#61978F" roughness={0.77} /></mesh>
    {holding && [-1, 0, 1].map((i) => <mesh key={i} position={[1.23 + i * 0.15, 0.02, 0.08 + i * 0.12]} scale={[0.05, 0.11, 0.05]}><sphereGeometry args={[1, 7, 5]} /><meshStandardMaterial color="#A7DCD8" roughness={0.3} /></mesh>)}
  </group></group>;
}

function WaterScene({ levels, pointer, holding, variation, reducedMotion, complete, tick }: {
  levels: number[]; pointer: Point; holding: boolean; variation: number; reducedMotion: boolean; complete: boolean; tick: (delta: number) => void;
}) {
  useFrame((_, delta) => tick(delta));
  return <>
    <StudioLight />
    <Arrival reducedMotion={reducedMotion}><GreenhouseEnvironment reducedMotion={reducedMotion} /></Arrival>
    <RoundedBoard width={8.4} depth={10.8} height={0.34} position={[0, -0.47, 0]} color="#C6A07C" />
    <RoundedBoard width={7.95} depth={10.3} height={0.12} position={[0, -0.24, 0]} color="#E7EED9" />
    {POTS.map((point, i) => <Pot key={i} point={point} level={levels[i]!} index={i} variation={variation} reducedMotion={reducedMotion} />)}
    <WateringCan point={pointer} holding={holding} reducedMotion={reducedMotion} />
    <ToolParticles point={pointer} active={holding && !complete} reducedMotion={reducedMotion} color="#C8E9E4" kind="drop" height={.8} />
    {complete && <FinishDust color="#B8DDD7" kind="drop" reducedMotion={reducedMotion} />}
  </>;
}

export const WaterGame3D = memo(function WaterGame3D(props: GameProps) {
  const controller = useMemo<SceneController>(() => ({ camera: null }), []);
  const levels = useRef([0, 0, 0, 0]);
  const pointer = useRef<Point>({ x: 160, y: 390 });
  const holding = useRef(false);
  const reported = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [view, setView] = useState({ levels: [...levels.current], pointer: pointer.current, holding: false });
  const [complete, setComplete] = useState(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller]);
  useEffect(() => { if (!props.enabled) { holding.current = false; setView((old) => ({ ...old, holding: false })); } }, [props.enabled]);
  const tick = (delta: number) => {
    if (!props.enabled || !holding.current || complete) return;
    waterAt(levels.current, pointer.current, Math.min(delta, 0.05));
    const percent = Math.floor(levels.current.reduce((a, b) => a + b, 0) / POTS.length * 100);
    if (percent !== reported.current) { reported.current = percent; props.onProgress(percent); setView((old) => ({ ...old, levels: [...levels.current] })); }
    if (percent >= 100) { holding.current = false; setComplete(true); timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 1000); }
  };
  const move = (point: Point, start: boolean) => {
    if (complete) return;
    if (start) {
      holding.current = Math.hypot(point.x - pointer.current.x, point.y - pointer.current.y) < 58;
      setView((old) => ({ ...old, holding: holding.current }));
    }
    if (holding.current) { pointer.current = point; setView((old) => ({ ...old, pointer: point })); }
  };
  const release = () => { holding.current = false; setView((old) => ({ ...old, holding: false })); };
  return <SceneFrame controller={controller} enabled={props.enabled} background={colors.background} cameraPosition={[2.3, 13.5, 11.5]} fov={51} label="Quatro vasos e um regador 3D. Arraste o regador da parte inferior até cada vaso e segure." onPoint={move} onRelease={release} onEnd={release}>
    <WaterScene levels={view.levels} pointer={view.pointer} holding={view.holding} variation={props.variation} reducedMotion={props.reducedMotion} complete={complete} tick={tick} />
  </SceneFrame>;
});
