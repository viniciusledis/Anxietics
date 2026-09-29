import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group, MathUtils } from 'three';
import { colors } from '../../ui/theme';
import { Point } from '../grass/coverage';
import { SceneController, SceneFrame, worldPoint } from '../three/SceneFrame';
import { RoundedBoard } from '../three/RoundedBoard';
import { GameProps } from '../types';
import { BALL_TARGETS, Piece, fits, hitPiece, makePieces } from './rules';
import { Arrival, SoftBox, StudioLight } from '../three/Diorama';
import { DeskEnvironment } from './DeskEnvironment';

const palettes = [
  ['#D78990', '#78A996', '#D4B662'],
  ['#87A6C5', '#B394BA', '#91AA77'],
  ['#DA9878', '#91A76F', '#A498C1'],
];
const stoneTones = ['#9CA8A0', '#BEAD95', '#8EA9A9', '#A79AA8'];

function Symbol({ group, color = '#36554A', raised = false }: { group: number; color?: string; raised?: boolean }) {
  const y = raised ? 0.725 : 0.15;
  return group === 0 ? <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <torusGeometry args={[0.14, 0.025, 5, 16]} /><meshStandardMaterial color={color} roughness={0.9} />
  </mesh> : group === 1 ? <mesh position={[0, y, 0]} rotation={[0, Math.PI / 4, 0]} scale={[0.19, 0.045, 0.19]}>
    <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={color} roughness={0.9} />
  </mesh> : <group position={[0, y, 0]}>
    {[-0.1, 0, 0.1].map((z) => <mesh key={z} position={[0, 0, z]} scale={[0.28, 0.04, 0.025]}>
      <boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={color} roughness={0.9} />
    </mesh>)}
  </group>;
}

function StoneShape({ group, color }: { group: number; color: string }) {
  return group === 0 ? <mesh scale={[0.56, 0.35, 0.56]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={color} roughness={0.96} /></mesh>
    : group === 1 ? <mesh scale={[0.7, 0.28, 0.42]}><sphereGeometry args={[1, 16, 10]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>
      : group === 2 ? <mesh rotation={[0, 0.7, 0]} scale={[0.62, 0.31, 0.49]}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color={color} roughness={0.94} flatShading /></mesh>
        : <SoftBox size={[1.03, .51, .85]} color={color} radius={.22} roughness={.65} />;
}

function MovingObject({ piece, index, balls, palette, placed, active, pointer, reducedMotion, complete }: {
  piece: Piece; index: number; balls: boolean; palette: string[]; placed: boolean; active: boolean; pointer: Point; reducedMotion: boolean; complete: boolean;
}) {
  const model = useRef<Group>(null);
  const previous = useRef({ placed: false, complete: false });
  const bounce = useRef(2);
  const target = active ? pointer : placed ? piece.target : piece.home;
  const [baseX, , baseZ] = worldPoint(target);
  const tx = baseX + (balls && placed && !active ? (index < 3 ? -.19 : .19) : 0);
  const tz = baseZ + (balls && placed && !active ? (index < 3 ? -.09 : .09) : 0);
  useFrame((_, delta) => {
    if (!model.current) return;
    if ((placed && !previous.current.placed) || (complete && !previous.current.complete)) bounce.current = 0;
    previous.current = { placed, complete };
    bounce.current += Math.min(delta, .05);
    const pulse = reducedMotion ? 0 : Math.sin(bounce.current * 18) * Math.exp(-bounce.current * 7) * .17;
    const fitScale = balls && placed && !active ? .74 : 1;
    model.current.scale.set(fitScale * (1 + pulse), fitScale * (1 - pulse * 1.3), fitScale * (1 + pulse));
    const rate = reducedMotion ? 45 : active ? 25 : 11;
    model.current.position.x = MathUtils.damp(model.current.position.x, tx, rate, Math.min(delta, 0.05));
    model.current.position.z = MathUtils.damp(model.current.position.z, tz, rate, Math.min(delta, 0.05));
    model.current.position.y = MathUtils.damp(model.current.position.y, active ? 0.38 : placed && balls ? -0.1 : 0.07, rate, Math.min(delta, 0.05));
    model.current.rotation.z = MathUtils.damp(model.current.rotation.z, active ? (index % 2 ? 0.09 : -0.09) : 0, 9, Math.min(delta, 0.05));
  });
  const [hx, , hz] = worldPoint(piece.home);
  return <group ref={model} position={[hx, 0.07, hz]}>
    <mesh position={[0.05, -0.14, 0.08]} scale={[0.6, 0.035, 0.42]}><sphereGeometry args={[1, 10, 6]} /><meshBasicMaterial color="#6F6A55" transparent opacity={0.15} depthWrite={false} /></mesh>
    {balls ? <>
      <mesh castShadow receiveShadow position={[0, 0.23, 0]} scale={[0.48, 0.48, 0.48]}><sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color={palette[piece.group]} roughness={0.3} clearcoat={.45} clearcoatRoughness={.25} /></mesh>
      <mesh position={[-0.13, 0.49, 0.12]} scale={[0.1, 0.045, 0.065]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#FFF7EC" roughness={0.48} /></mesh>
      <Symbol group={piece.group} color="#2F4F45" raised />
    </> : <>
      <mesh position={[0, 0.12, 0]}><StoneShape group={piece.group} color={stoneTones[piece.group]!} /></mesh>
      <mesh position={[-0.14, 0.39, 0.08]} rotation={[0, 0.4, 0]} scale={[0.2, 0.025, 0.04]}><sphereGeometry args={[1, 8, 5]} /><meshStandardMaterial color="#DDE1D4" roughness={1} /></mesh>
    </>}
  </group>;
}

function ArrangementScene({ pieces, placed, active, pointer, balls, palette, reducedMotion, complete }: {
  pieces: Piece[]; placed: number[]; active: number; pointer: Point; balls: boolean; palette: string[]; reducedMotion: boolean; complete: boolean;
}) {
  return <>
    <StudioLight />
    <Arrival reducedMotion={reducedMotion}><DeskEnvironment balls={balls} reducedMotion={reducedMotion} /></Arrival>
    {balls ? <>
      <mesh position={[0, -0.11, 2.3]} scale={[7.2, 0.05, 3.6]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#E8D8BD" roughness={1} /></mesh>
      {BALL_TARGETS.map((point, i) => {
        const [x, , z] = worldPoint(point);
        return <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.63, 0.56, 0.48, 20, 1, true]} /><meshStandardMaterial color={palette[i]} side={2} roughness={0.88} /></mesh>
          <mesh position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.6, 0.075, 6, 20]} /><meshStandardMaterial color={palette[i]} roughness={0.8} /></mesh>
          <mesh position={[0, -0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.55, 20]} /><meshStandardMaterial color="#6E755B" roughness={1} /></mesh>
          <Symbol group={i} color="#FFF7E8" />
        </group>;
      })}
    </> : pieces.map((piece, i) => {
      const [x, , z] = worldPoint(piece.target);
      return <group key={i} position={[x, -0.01, z]}>
        <group scale={[1.24, .24, 1.24]}><StoneShape group={piece.group} color="#9CA991" /></group>
        <group position={[0, .022, 0]} scale={[1.08, .22, 1.08]}><StoneShape group={piece.group} color={placed[i] ? '#B1C394' : '#E5E7D2'} /></group>
      </group>;
    })}
    {pieces.map((piece, i) => <MovingObject key={i} piece={piece} index={i} balls={balls} palette={palette} placed={!!placed[i]} active={active === i} pointer={pointer} reducedMotion={reducedMotion} complete={complete} />)}
  </>;
}

export const ArrangeGame3D = memo(function ArrangeGame3D(props: GameProps) {
  const balls = props.game === 'balls';
  const pieces = useMemo(() => makePieces(balls), [balls]);
  const controller = useMemo<SceneController>(() => ({ camera: null }), []);
  const placed = useRef(pieces.map(() => 0));
  const active = useRef(-1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [view, setView] = useState({ placed: [...placed.current], active: -1, pointer: { x: 0, y: 0 } });
  const [complete, setComplete] = useState(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller]);
  useEffect(() => { if (!props.enabled) { active.current = -1; setView((old) => ({ ...old, active: -1 })); } }, [props.enabled]);
  const point = (p: Point, start: boolean) => {
    if (complete) return;
    if (start) active.current = hitPiece(pieces, placed.current, p);
    if (active.current >= 0) setView((old) => ({ ...old, active: active.current, pointer: p }));
  };
  const release = (p: Point | null, success: boolean) => {
    const i = active.current;
    if (i >= 0 && p && success && fits(pieces[i]!, p) && !placed.current[i]) {
      placed.current[i] = 1;
      const count = placed.current.reduce((a, b) => a + b, 0);
      props.onProgress(Math.floor(count / pieces.length * 100));
      if (count === pieces.length) { setComplete(true); timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 750); }
    }
    active.current = -1;
    setView((old) => ({ ...old, active: -1, placed: [...placed.current] }));
  };
  return <SceneFrame controller={controller} enabled={props.enabled} background={colors.background} cameraPosition={balls ? [1.7, 14, 11.5] : [-2.8, 14.5, 11]} fov={52} label={balls ? 'Bolinhas 3D com cestos correspondentes por cor e símbolo. Arraste cada bolinha.' : 'Quatro pedras 3D e seus encaixes. Arraste cada pedra ao lugar correspondente.'} onPoint={point} onRelease={release} onEnd={() => { if (active.current >= 0) release(null, false); }}>
    <ArrangementScene pieces={pieces} placed={view.placed} active={view.active} pointer={view.pointer} balls={balls} palette={palettes[props.variation % 3]!} reducedMotion={props.reducedMotion} complete={complete} />
  </SceneFrame>;
});
