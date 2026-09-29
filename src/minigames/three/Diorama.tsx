import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import { Group, LatheGeometry, MathUtils, PerspectiveCamera, Vector2 } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

type V3 = [number, number, number];

/** Visual vocabulary only. No game state, input or progression lives here. */
export function SoftBox({ size, position = [0, 0, 0], color, radius = .08, roughness = .72, rotation = [0, 0, 0] }: {
  size: V3; position?: V3; color: string; radius?: number; roughness?: number; rotation?: V3;
}) {
  const geometry = useMemo(() => new RoundedBoxGeometry(...size, 4, Math.min(radius, ...size.map(v => v / 2))), [size[0], size[1], size[2], radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow><meshStandardMaterial color={color} roughness={roughness} /></mesh>;
}

export function Pebble({ position = [0, 0, 0], scale = [1, 1, 1], color = '#A7B3A1', rotation = [0, 0, 0], roughness = .8 }: {
  position?: V3; scale?: V3; color?: string; rotation?: V3; roughness?: number;
}) {
  return <mesh position={position} scale={scale} rotation={rotation} castShadow receiveShadow><sphereGeometry args={[1, 20, 14]} /><meshStandardMaterial color={color} roughness={roughness} /></mesh>;
}

export function Vessel({ position = [0, 0, 0], scale = 1, color = '#CF987A', glaze = false }: { position?: V3; scale?: number; color?: string; glaze?: boolean }) {
  const geometry = useMemo(() => new LatheGeometry([
    new Vector2(.01, 0), new Vector2(.29, 0), new Vector2(.34, .05), new Vector2(.4, .38),
    new Vector2(.42, .55), new Vector2(.46, .57), new Vector2(.46, .64), new Vector2(.38, .65),
    new Vector2(.36, .55), new Vector2(.3, .1), new Vector2(.01, .1),
  ], 32), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <group position={position} scale={scale}>
    <mesh geometry={geometry} castShadow receiveShadow><meshPhysicalMaterial color={color} roughness={glaze ? .3 : .82} clearcoat={glaze ? .4 : .05} clearcoatRoughness={.3} /></mesh>
    <mesh position={[0, .47, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.36, 24]} /><meshStandardMaterial color="#5E5140" roughness={1} /></mesh>
    <mesh position={[0, .15, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.352, .018, 6, 32]} /><meshStandardMaterial color="#E5BD98" /></mesh>
  </group>;
}

export function Plant({ position = [0, 0, 0], scale = 1, pot = '#CF987A', flowers = false, reducedMotion = false }: {
  position?: V3; scale?: number; pot?: string; flowers?: boolean; reducedMotion?: boolean;
}) {
  const leaves = useRef<Group>(null);
  useFrame(({ clock }) => { if (leaves.current && !reducedMotion) leaves.current.rotation.z = Math.sin(clock.elapsedTime * .8 + position[0]) * .025; });
  return <group position={position} scale={scale}>
    <Vessel color={pot} />
    <group ref={leaves} position={[0, .48, 0]}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = i * 2.4; const r = i < 6 ? .32 : .16;
        return <group key={i} rotation={[0, a, 0]}>
          <Pebble position={[r, .25 + i % 3 * .15, 0]} scale={[.32, .09, .14]} rotation={[0, 0, .65 + i % 3 * .2]} color={['#406E4F', '#729854', '#93AE68'][i % 3]} />
          {flowers && i % 3 === 0 && <Blossom position={[r, .72 + i * .02, 0]} scale={.6} color={i % 2 ? '#F7E7BC' : '#E8A18C'} />}
        </group>;
      })}
    </group>
  </group>;
}

export function Blossom({ position = [0, 0, 0], scale = 1, color = '#E8A18C' }: { position?: V3; scale?: number; color?: string }) {
  return <group position={position} scale={scale}>
    {Array.from({ length: 6 }, (_, i) => <Pebble key={i} position={[Math.cos(i * Math.PI / 3) * .17, 0, Math.sin(i * Math.PI / 3) * .17]} rotation={[0, -i * Math.PI / 3, .15]} scale={[.2, .07, .105]} color={color} roughness={.6} />)}
    <Pebble position={[0, .05, 0]} scale={[.105, .075, .105]} color="#EAC468" />
  </group>;
}

export function StudioLight({ night = false }: { night?: boolean }) {
  return <>
    <hemisphereLight args={[night ? '#9EBACD' : '#FFF2DB', night ? '#173C3C' : '#7E8D7A', night ? .65 : .85]} />
    <directionalLight position={[-4, 8, 3]} color={night ? '#B7D4DF' : '#FFE1B6'} intensity={night ? 1 : 2.3} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-camera-near={.5} shadow-camera-far={30} shadow-bias={-.0006} shadow-normalBias={.025} shadow-radius={3} />
    <directionalLight position={[5, 3, 1]} color="#C8DFE6" intensity={night ? .55 : .7} />
    <directionalLight position={[1, 5, -6]} color={night ? '#F2BD76' : '#FFF4CF'} intensity={night ? 1.3 : 1.8} />
  </>;
}

export function RoomShell({ color = '#E7DDC7', wood = '#B48A65', tiles = false }: { color?: string; wood?: string; tiles?: boolean }) {
  return <>
    <SoftBox size={[8.4, .48, 10.7]} position={[0, -.57, 0]} color={wood} radius={.2} />
    <SoftBox size={[8.3, .16, 10.55]} position={[0, -.26, 0]} color={color} radius={.16} />
    <SoftBox size={[8.2, 1.65, .2]} position={[0, .54, -5.15]} color={color} />
    <SoftBox size={[8.25, .15, .28]} position={[0, 1.39, -5.15]} color={wood} />
    <SoftBox size={[.18, .65, 3]} position={[-4.03, .1, -3.8]} color={color} />
    {tiles && Array.from({ length: 16 }, (_, i) => <SoftBox key={i} size={[.94, .56, .04]} position={[-3.5 + i % 8, .2 + Math.floor(i / 8) * .64, -5.025]} color={i % 3 ? '#F8EAD4' : '#B6C9B5'} radius={.035} roughness={.35} />)}
  </>;
}

export function Shelf({ position = [0, .9, -4.85], width = 3 }: { position?: V3; width?: number }) {
  return <group position={position}>
    <SoftBox size={[width, .13, .55]} color="#BF9167" />
    {[-1, 1].map(s => <SoftBox key={s} size={[.12, .35, .22]} position={[s * width * .35, -.19, -.1]} color="#7A7257" />)}
  </group>;
}

export function Motes({ color = '#F4DE9B', reducedMotion = false, count = 18 }: { color?: string; reducedMotion?: boolean; count?: number }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return;
    ref.current.children.forEach((p, i) => { p.position.y = .5 + (i % 5) * .32 + Math.sin(clock.elapsedTime * .5 + i * 1.7) * .13; p.scale.setScalar(.016 + .012 * (1 + Math.sin(clock.elapsedTime + i))); });
  });
  return <group ref={ref}>{Array.from({ length: count }, (_, i) => <mesh key={i} position={[Math.sin(i * 7.3) * 3.7, .5 + i % 5 * .32, Math.cos(i * 4.7) * 4.4]} scale={.025}><sphereGeometry args={[1, 6, 5]} /><meshBasicMaterial color={color} /></mesh>)}</group>;
}

export function Arrival({ children, reducedMotion }: { children: ReactNode; reducedMotion: boolean }) {
  const group = useRef<Group>(null); const time = useRef(0);
  useFrame((_, delta) => { time.current = Math.min(1, time.current + delta * 2); if (group.current) group.current.position.y = reducedMotion ? 0 : -.22 * Math.pow(1 - time.current, 3); });
  return <group ref={group}>{children}</group>;
}

export function CompletionDolly({ complete, reducedMotion, amount = 1.5 }: { complete: boolean; reducedMotion: boolean; amount?: number }) {
  const camera = useThree(state => state.camera) as PerspectiveCamera;
  const initial = useRef(camera.fov);
  useFrame((_, delta) => {
    if (!complete || reducedMotion || !camera.isPerspectiveCamera) return;
    camera.fov = MathUtils.damp(camera.fov, initial.current - amount, 3, Math.min(delta, .05));
    camera.updateProjectionMatrix();
  });
  return null;
}

/** Petals, droplets or warm dust; deliberately no shared confetti burst. */
export function FinishDust({ color, kind = 'petal', reducedMotion = false }: { color: string; kind?: 'petal' | 'drop' | 'dust'; reducedMotion?: boolean }) {
  const ref = useRef<Group>(null); const time = useRef(0);
  useFrame((_, delta) => {
    time.current += Math.min(delta, .05);
    if (!ref.current || reducedMotion) return;
    ref.current.children.forEach((p, i) => {
      const t = time.current; const a = i * 2.4;
      p.position.set(Math.sin(a) * (1 + t * 1.6), .3 + Math.sin(Math.min(1, t) * Math.PI) * (1 + i % 3 * .3), Math.cos(a) * (1.5 + t));
      p.rotation.set(t * 2 + i, a, t * .8);
      p.scale.setScalar(Math.max(.01, 1 - t * .7));
    });
  });
  return <group ref={ref}>{Array.from({ length: 24 }, (_, i) => <group key={i}><Pebble scale={kind === 'petal' ? [.1, .025, .18] : kind === 'drop' ? [.055, .16, .055] : [.035, .035, .035]} color={i % 3 ? color : '#FFF1C7'} roughness={.35} /></group>)}</group>;
}
