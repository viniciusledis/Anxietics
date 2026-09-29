import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Color, InstancedMesh, Object3D, RingGeometry } from 'three';
import { colors } from '../../ui/theme';
import { GAME_INFO } from '../definitions';
import { Point } from '../grass/coverage';
import { SceneController, SceneFrame, worldPoint } from '../three/SceneFrame';
import { RoundedBoard } from '../three/RoundedBoard';
import { GameProps } from '../types';
import { INK_INTERACTIONS, INK_LIMIT, InkState, addInk, countInk, createInk, expandInk } from './rules';
import { Arrival, FinishDust, StudioLight } from '../three/Diorama';
import { MarblingEnvironment } from './MarblingEnvironment';

type InkController = SceneController & { ink: InkState };

function InkPool({ controller, enabled, reducedMotion }: { controller: InkController; enabled: boolean; reducedMotion: boolean }) {
  const rings = useRef<InstancedMesh>(null);
  const cores = useRef<InstancedMesh>(null);
  const centers = useRef<InstancedMesh>(null);
  const filaments = useRef<InstancedMesh>(null);
  const ribbon = useMemo(() => {
    const geo = new RingGeometry(.87, 1, 80, 3);
    const p = geo.attributes.position!;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), a = Math.atan2(y, x);
      const wave = 1 + Math.sin(a * 5) * .075 + Math.cos(a * 3) * .055;
      p.setXY(i, x * wave, y * wave);
    }
    geo.computeVertexNormals(); return geo;
  }, []);
  useEffect(() => () => ribbon.dispose(), [ribbon]);
  const dummy = useMemo(() => new Object3D(), []);
  useEffect(() => {
    if (rings.current) rings.current.count = 0;
    if (cores.current) cores.current.count = 0;
    if (centers.current) centers.current.count = 0;
    if (filaments.current) filaments.current.count = 0;
  }, []);
  useFrame(({ clock }, delta) => {
    const ring = rings.current;
    const core = cores.current;
    const center = centers.current;
    if (!ring || !core || !center) return;
    const state = controller.ink;
    if (enabled && !reducedMotion) expandInk(state, Math.min(delta, 0.05));
    const count = state.drops.length;
    ring.count = core.count = center.count = count;
    if (filaments.current) filaments.current.count = count * 4;
    for (let i = 0; i < count; i++) {
      const drop = state.drops[i]!;
      const [x, , z] = worldPoint(drop);
      const shade = new Color(GAME_INFO.ink.colors![drop.color]!);
      ring.setColorAt(i, shade);
      core.setColorAt(i, shade);
      center.setColorAt(i, shade);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.position.set(x, 0.042 + i * 0.00025, z);
      dummy.scale.setScalar(drop.radius / 50 * 1.35);
      dummy.updateMatrix(); ring.setMatrixAt(i, dummy.matrix);
      dummy.position.y += 0.006;
      dummy.scale.setScalar(drop.radius / 50 * .95);
      dummy.updateMatrix(); core.setMatrixAt(i, dummy.matrix);
      dummy.rotation.set(0, 0, 0);
      dummy.position.y = 0.075;
      dummy.scale.set(.14, .028, .14);
      dummy.updateMatrix(); center.setMatrixAt(i, dummy.matrix);
      if (filaments.current) for (let j = 0; j < 4; j++) {
        dummy.rotation.set(-Math.PI / 2, 0, i * .7 + j * .37 + (reducedMotion ? 0 : clock.elapsedTime * .035));
        dummy.position.set(x + Math.sin(j * 2.4) * .04, .062 + i * .0003 + j * .0001, z + Math.cos(j * 2.4) * .04);
        dummy.scale.setScalar(drop.radius / 50 * (.35 + j * .28));
        dummy.updateMatrix(); filaments.current.setMatrixAt(i * 4 + j, dummy.matrix);
        filaments.current.setColorAt(i * 4 + j, shade);
      }
    }
    if (count) {
      ring.instanceMatrix.needsUpdate = core.instanceMatrix.needsUpdate = center.instanceMatrix.needsUpdate = true;
      if (ring.instanceColor) ring.instanceColor.needsUpdate = true;
      if (core.instanceColor) core.instanceColor.needsUpdate = true;
      if (center.instanceColor) center.instanceColor.needsUpdate = true;
      if (filaments.current) { filaments.current.instanceMatrix.needsUpdate = true; if (filaments.current.instanceColor) filaments.current.instanceColor.needsUpdate = true; }
    }
  });
  return <>
    <instancedMesh ref={filaments} args={[ribbon, undefined, INK_LIMIT * 4]} frustumCulled={false} renderOrder={3}>
      <meshBasicMaterial color="#FFFFFF" transparent opacity={.45} depthWrite={false} side={2} />
    </instancedMesh>
    <instancedMesh ref={rings} args={[undefined, undefined, INK_LIMIT]} frustumCulled={false} renderOrder={1}>
      <circleGeometry args={[1, 64]} /><meshBasicMaterial color="#FFFFFF" transparent opacity={0.46} depthWrite={false} side={2} />
    </instancedMesh>
    <instancedMesh ref={cores} args={[undefined, undefined, INK_LIMIT]} frustumCulled={false} renderOrder={2}>
      <circleGeometry args={[1, 48]} /><meshBasicMaterial color="#FFFFFF" transparent opacity={0.32} depthWrite={false} side={2} />
    </instancedMesh>
    <instancedMesh ref={centers} args={[undefined, undefined, INK_LIMIT]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#FFFFFF" roughness={0.48} />
    </instancedMesh>
  </>;
}

function InkScene({ controller, enabled, reducedMotion, variation, complete }: {
  controller: InkController; enabled: boolean; reducedMotion: boolean; variation: number; complete: boolean;
}) {
  const water = ['#A8D4CE', '#A7CEDC', '#C4D6BD'][variation % 3]!;
  return <>
    <StudioLight />
    <Arrival reducedMotion={reducedMotion}><MarblingEnvironment reducedMotion={reducedMotion} /></Arrival>
    <RoundedBoard width={8.6} depth={10.9} height={0.32} position={[0, -0.47, 0]} color="#C2A27A" />
    <RoundedBoard width={8.1} depth={10.4} height={0.16} position={[0, -0.24, 0]} color="#F5EBD8" />
    <RoundedBoard width={7.65} depth={9.95} height={0.11} position={[0, -0.04, 0]} color={water} roughness={0.42} />
    <InkPool controller={controller} enabled={enabled} reducedMotion={reducedMotion} />
    {[-1, 1].map((side) => <group key={side} position={[side * 3.72, 0.08, -4.45]}>
      {[0, 1, 2].map((i) => <mesh key={i} position={[side * (i * 0.14), 0.02 + i * 0.05, i * 0.2]} rotation={[0, 0, side * 0.35]} scale={[0.2, 0.06, 0.12]}><sphereGeometry args={[1, 9, 6]} /><meshStandardMaterial color={i % 2 ? '#79A077' : '#A3B782'} roughness={0.95} /></mesh>)}
    </group>)}
    {complete && <FinishDust color="#B4D9D6" kind="drop" reducedMotion={reducedMotion} />}
  </>;
}

export const InkGame3D = memo(function InkGame3D(props: GameProps) {
  const controller = useMemo<InkController>(() => ({ camera: null, ink: createInk() }), []);
  const lastStamp = useRef<Point | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [complete, setComplete] = useState(false);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller]);
  const move = (point: Point, start: boolean) => {
    if (complete) return;
    const state = controller.ink;
    if (start || !lastStamp.current) {
      lastStamp.current = point;
      addInk(state, point, props.color, props.reducedMotion);
      countInk(state, props.color);
      if (props.mode !== 'free') {
        const count = state.counts.reduce((a, b) => a + b, 0);
        props.onProgress(Math.floor(count / (INK_INTERACTIONS * 3) * 100));
        if (count === INK_INTERACTIONS * 3) { setComplete(true); timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 900); }
      }
      return;
    }
    const from = lastStamp.current;
    const length = Math.hypot(point.x - from.x, point.y - from.y);
    if (length < 10) return;
    const steps = Math.ceil(length / 18);
    for (let i = 1; i <= steps; i++) addInk(state, { x: from.x + (point.x - from.x) * i / steps, y: from.y + (point.y - from.y) * i / steps }, props.color, props.reducedMotion);
    lastStamp.current = point;
  };
  return <SceneFrame controller={controller} enabled={props.enabled} background={colors.background} cameraPosition={[-1.8, 13.5, 10]} fov={51} label="Tigela de água 3D para espalhar tinta. Escolha as três cores acima e toque ou arraste na água." onPoint={move} onEnd={() => { lastStamp.current = null; }}>
    <InkScene controller={controller} enabled={props.enabled} reducedMotion={props.reducedMotion} variation={props.variation} complete={complete} />
  </SceneFrame>;
});
