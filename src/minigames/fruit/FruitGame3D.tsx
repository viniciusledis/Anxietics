import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group, MathUtils } from 'three';
import { colors } from '../../ui/theme';
import { Point } from '../grass/coverage';
import { SceneController, SceneFrame, worldPoint } from '../three/SceneFrame';
import { RoundedBoard } from '../three/RoundedBoard';
import { GameProps } from '../types';
import { FRUITS, sliceFruit } from './rules';
import { KitchenEnvironment } from './KitchenEnvironment';
import { Arrival, FinishDust, StudioLight } from '../three/Diorama';

const fruitSkins = ['#E8A34F', '#829B5B', '#79A281'];
const fruitFlesh = ['#F5D57A', '#D5DEA1', '#DF8794'];
const fruitRind = ['#FFF0CE', '#ECE8B4', '#DCEBC7'];

function FruitActor({ point, index, variation, cut, reducedMotion }: {
  point: Point; index: number; variation: number; cut: boolean; reducedMotion: boolean;
}) {
  const top = useRef<Group>(null);
  const bottom = useRef<Group>(null);
  const burst = useRef<Group>(null);
  const energy = useRef(0);
  const wasCut = useRef(false);
  const [x, , z] = worldPoint(point);
  const kind = variation % 3;
  const skin = fruitSkins[kind]!;
  const flesh = fruitFlesh[kind]!;
  useFrame((_, delta) => {
    if (cut && !wasCut.current) { energy.current = 1; wasCut.current = true; }
    const t = Math.min(delta, 0.05);
    if (top.current) {
      const lift = cut ? 0.15 : 0;
      top.current.position.y = MathUtils.damp(top.current.position.y, lift, reducedMotion ? 40 : 8, t);
      top.current.position.x = MathUtils.damp(top.current.position.x, cut ? (index % 2 ? 0.46 : -0.46) : 0, 7, t);
      top.current.rotation.z = MathUtils.damp(top.current.rotation.z, cut ? (index % 2 ? -0.6 : 0.6) : 0, 6, t);
    }
    if (bottom.current) bottom.current.scale.setScalar(1 + energy.current * 0.045);
    if (burst.current) {
      burst.current.visible = energy.current > 0.04;
      burst.current.scale.setScalar(1 + (1 - energy.current) * 1.1);
    }
    energy.current = Math.max(0, energy.current - t * (reducedMotion ? 6 : 1.8));
  });
  return (
    <group position={[x, 0.25, z]}>
      <mesh position={[0.08, -0.18, 0.1]} scale={[0.95, 0.07, 0.78]}>
        <sphereGeometry args={[0.72, 12, 8]} />
        <meshBasicMaterial color="#736A4C" transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {!cut ? (
        <group>
          <mesh castShadow receiveShadow scale={[0.97, kind === 1 ? 1.06 : 0.88, 0.9]}><sphereGeometry args={[0.78, 32, 24]} /><meshPhysicalMaterial color={skin} roughness={kind === 1 ? .95 : .48} clearcoat={.18} /></mesh>
          {Array.from({ length: kind === 2 ? 9 : 25 }, (_, j) => {
            const a = j * 2.399; const yy = -.5 + j / 25;
            const r = Math.sqrt(Math.max(0, .56 - yy * yy));
            return <mesh key={j} position={[Math.cos(a) * r * .97, yy * .88, Math.sin(a) * r * .9]} scale={kind === 1 ? [.018, .04, .018] : [.026, .018, .026]}><sphereGeometry args={[1, 6, 5]} /><meshStandardMaterial color={kind === 0 ? '#EDB862' : kind === 1 ? '#665F3D' : '#47785B'} roughness={.85} /></mesh>;
          })}
          <mesh position={[0, 0.56, 0]} rotation={[0, 0, -0.5]} scale={[0.17, 0.42, 0.12]}>
            <sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color="#547955" roughness={0.9} />
          </mesh>
          <mesh position={[0.1, 0.62, -0.05]} rotation={[0.1, 0.7, -0.4]} scale={[0.35, 0.07, 0.2]}>
            <sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color="#7FA66C" roughness={0.9} />
          </mesh>
        </group>
      ) : (
        <>
          <group ref={bottom}>
            <mesh scale={[0.97, 0.82, 0.9]}><sphereGeometry args={[0.72, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /><meshStandardMaterial color={skin} roughness={0.82} /></mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[0.69, 0.62, 1]}><circleGeometry args={[1, 20]} /><meshStandardMaterial color={fruitRind[kind]} roughness={0.92} side={2} /></mesh>
            <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.58, 0.53, 1]}><circleGeometry args={[1, 20]} /><meshStandardMaterial color={flesh} roughness={0.9} side={2} /></mesh>
            {kind === 0 && Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[Math.cos(i * Math.PI / 4) * .26, .015, Math.sin(i * Math.PI / 4) * .24]} rotation={[0, -i * Math.PI / 4, 0]} scale={[.53, .015, .018]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#FFF0BD" roughness={.65} /></mesh>)}
            {Array.from({ length: 5 }, (_, seed) => (
              <mesh key={seed} position={[Math.cos(seed * 1.256) * 0.32, 0.018, Math.sin(seed * 1.256) * 0.27]} scale={[0.055, 0.015, 0.11]} rotation={[0, seed * 1.256, 0]}>
                <sphereGeometry args={[1, 8, 5]} /><meshStandardMaterial color={kind === 2 ? '#473D38' : '#FFF5CF'} roughness={1} />
              </mesh>
            ))}
          </group>
          <group ref={top}>
            <mesh scale={[0.97, 0.82, 0.9]}><sphereGeometry args={[0.72, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={skin} roughness={0.82} /></mesh>
            <mesh position={[0, 0.6, 0]} scale={[0.2, 0.35, 0.16]} rotation={[0, 0, -0.4]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color="#638B5C" roughness={0.9} /></mesh>
          </group>
          <group ref={burst} visible={false} position={[0, 0.15, 0]}>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} position={[Math.cos(i * 1.256) * 0.87, 0.22 + (i % 2) * 0.14, Math.sin(i * 1.256) * 0.75]} scale={[0.07, 0.12, 0.07]}>
                <sphereGeometry args={[1, 6, 5]} /><meshStandardMaterial color={i % 2 ? flesh : '#FFF7D8'} roughness={0.9} />
              </mesh>
            ))}
          </group>
        </>
      )}
    </group>
  );
}

function KitchenScene({ sliced, variation, reducedMotion, complete }: {
  sliced: number[]; variation: number; reducedMotion: boolean; complete: boolean;
}) {
  return (
    <>
      <StudioLight />
      <Arrival reducedMotion={reducedMotion}><KitchenEnvironment reducedMotion={reducedMotion} /></Arrival>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 3.52, 0, 0]}>
          {[-3.6, -2.4, 2.6, 3.7].map((z, i) => (
            <mesh key={z} position={[side * (i % 2 ? 0.19 : 0.05), 0.01, z]} rotation={[0, 0, side * 0.3]} scale={[0.2, 0.055, 0.43]}>
              <sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color={i % 2 ? '#8EAD77' : '#668D69'} roughness={0.95} />
            </mesh>
          ))}
        </group>
      ))}
      {FRUITS.map((point, index) => {
        const [x, , z] = worldPoint(point);
        return <group key={index}>
          <mesh position={[x, -0.09, z]} scale={[0.95, 0.07, 0.95]}><cylinderGeometry args={[1, 1, 1, 20]} /><meshStandardMaterial color="#F9F2DF" roughness={0.97} /></mesh>
          <mesh position={[x, -0.045, z]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.77, 0.035, 5, 22]} /><meshStandardMaterial color="#E3D6B8" roughness={0.93} /></mesh>
          <FruitActor point={point} index={index} variation={variation} cut={!!sliced[index]} reducedMotion={reducedMotion} />
        </group>;
      })}
      {complete && <FinishDust color={fruitFlesh[variation % 3]!} kind="drop" reducedMotion={reducedMotion} />}
    </>
  );
}

export const FruitGame3D = memo(function FruitGame3D(props: GameProps) {
  const controller = useMemo<SceneController>(() => ({ camera: null }), []);
  const sliced = useRef([0, 0, 0, 0, 0, 0]);
  const previous = useRef<Point | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [rendered, setRendered] = useState([0, 0, 0, 0, 0, 0]);
  const [complete, setComplete] = useState(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller]);
  const move = (point: Point, start: boolean) => {
    if (complete) return;
    if (start || !previous.current) { previous.current = point; return; }
    const before = sliced.current.reduce((a, b) => a + b, 0);
    sliceFruit(sliced.current, previous.current, point);
    previous.current = point;
    const after = sliced.current.reduce((a, b) => a + b, 0);
    if (after === before) return;
    setRendered([...sliced.current]);
    props.onProgress(Math.floor(after / FRUITS.length * 100));
    if (after === FRUITS.length) {
      setComplete(true);
      timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 850);
    }
  };
  return (
    <SceneFrame controller={controller} enabled={props.enabled} background={colors.background} cameraPosition={[3, 14, 11]} fov={50} label="Tabuleiro 3D com seis frutas. Passe o dedo através de cada fruta para cortá-la." onPoint={move} onEnd={() => { previous.current = null; }}>
      <KitchenScene sliced={rendered} variation={props.variation} reducedMotion={props.reducedMotion} complete={complete} />
    </SceneFrame>
  );
});
