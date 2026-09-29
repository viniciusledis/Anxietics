import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group, InstancedMesh, MathUtils, Object3D, Quaternion, Vector3 } from 'three';
import { Point } from '../grass/coverage';
import { SceneController, SceneFrame, worldPoint } from '../three/SceneFrame';
import { RoundedBoard } from '../three/RoundedBoard';
import { GameProps } from '../types';
import { CONSTELLATIONS, lightSegment } from './rules';
import { LanternEnvironment } from './LanternEnvironment';
import { Arrival, SoftBox, StudioLight } from '../three/Diorama';

const dark = '#285A47';
const warm = '#FFE7A7';

function NightSparkles() {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  useEffect(() => {
    if (!mesh.current) return;
    for (let i = 0; i < 26; i++) {
      const x = (((i * 37) % 101) / 101) * 6.5 - 3.25;
      const z = (((i * 61) % 97) / 97) * 8.4 - 4.2;
      dummy.position.set(x, -0.09, z);
      dummy.scale.setScalar(i % 4 === 0 ? 0.047 : 0.025);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);
  return <instancedMesh ref={mesh} args={[undefined, undefined, 26]} frustumCulled={false}>
    <sphereGeometry args={[1, 6, 5]} /><meshBasicMaterial color="#A0C197" />
  </instancedMesh>;
}

function Bulb({ point, index, lit, next, reducedMotion }: {
  point: Point; index: number; lit: boolean; next: boolean; reducedMotion: boolean;
}) {
  const lantern = useRef<Group>(null);
  const sparkle = useRef<Group>(null);
  const pulse = useRef(0);
  const wasLit = useRef(false);
  const [x, , z] = worldPoint(point);
  useFrame((_, delta) => {
    if (lit && !wasLit.current) { wasLit.current = true; pulse.current = 1; }
    const t = Math.min(delta, 0.05);
    if (lantern.current) {
      lantern.current.scale.setScalar(MathUtils.damp(lantern.current.scale.x, (lit ? 1.18 : next ? 1.06 : 1) + (reducedMotion ? 0 : pulse.current * .16), reducedMotion ? 35 : 8, t));
      lantern.current.position.y = MathUtils.damp(lantern.current.position.y, lit ? 0.18 : 0, 6, t);
    }
    if (sparkle.current) {
      sparkle.current.visible = pulse.current > 0.02;
      sparkle.current.scale.setScalar(1 + (1 - pulse.current) * 0.7);
    }
    pulse.current = Math.max(0, pulse.current - t * (reducedMotion ? 6 : 1.5));
  });
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.61, 0.61, 1]}>
        <circleGeometry args={[1, 16]} /><meshBasicMaterial color="#0D2A25" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <group ref={lantern}>
        <SoftBox size={[.82, .13, .82]} position={[0, .08, 0]} color={lit ? '#D9AE61' : '#597779'} radius={.12} />
        {[-1, 1].flatMap(a => [-1, 1].map(b => <SoftBox key={`${a}:${b}`} size={[.055, .77, .055]} position={[a * .3, .51, b * .3]} color="#9D9B71" radius={.02} />))}
        <SoftBox size={[.76, .12, .76]} position={[0, .93, 0]} color={lit ? '#D3A45A' : '#71857B'} radius={.12} />
        <mesh position={[0, 1.06, 0]}><torusGeometry args={[.14, .025, 8, 20]} /><meshStandardMaterial color="#B8A571" roughness={.45} metalness={.2} /></mesh>
        <mesh position={[0, 0.14, 0]} scale={[0.58, 0.22, 0.58]}>
          <cylinderGeometry args={[1, 1.08, 1, 16]} /><meshStandardMaterial color={lit ? '#DFAF59' : '#6A8D75'} roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.53, 0]} scale={[0.27, 0.34, 0.27]}>
          <sphereGeometry args={[1, 24, 18]} /><meshStandardMaterial color={lit ? warm : next ? '#E9DCA4' : '#83A4A4'} emissive={lit ? '#F9C761' : '#152E29'} emissiveIntensity={lit ? 1.8 : next ? .3 : .08} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.53, 0]} scale={[0.17, 0.07, 0.17]}>
          <sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color={lit ? '#FFF6D4' : '#DDE8D5'} roughness={0.7} />
        </mesh>
      </group>
      {lit && <pointLight position={[0, .65, 0]} color="#FFC56C" intensity={2.3} distance={2.4} decay={2} />}
      <group ref={sparkle} visible={false} position={[0, 0.55, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 2) * 0.55, (i % 2) * 0.16, Math.sin(i * Math.PI / 2) * 0.55]} scale={[0.055, 0.1, 0.055]}>
            <sphereGeometry args={[1, 6, 5]} /><meshBasicMaterial color="#FFF5BD" />
          </mesh>
        ))}
      </group>
      {index === 0 && <mesh position={[0, -0.06, 0.68]} scale={[0.22, 0.08, 0.14]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#B5BA72" roughness={1} /></mesh>}
    </group>
  );
}

function LitPath({ a, b }: { a: Point; b: Point }) {
  const av = new Vector3(...worldPoint(a, 0.13));
  const bv = new Vector3(...worldPoint(b, 0.13));
  const direction = bv.clone().sub(av);
  const quaternion = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize());
  const center = av.add(bv).multiplyScalar(0.5);
  return <mesh position={center} quaternion={quaternion}>
    <cylinderGeometry args={[0.045, 0.045, direction.length(), 6]} />
    <meshStandardMaterial color="#E8C576" emissive="#C49345" emissiveIntensity={0.12} roughness={0.75} />
  </mesh>;
}

function NightScene({ points, lit, reducedMotion, complete }: {
  points: Point[]; lit: number; reducedMotion: boolean; complete: boolean;
}) {
  return <>
    <StudioLight night />
    <Arrival reducedMotion={reducedMotion}><LanternEnvironment reducedMotion={reducedMotion} complete={complete} /></Arrival>
    <NightSparkles />
    <mesh position={[2.65, -0.085, -3.8]} scale={[0.42, 0.04, 0.42]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#E5D6A0" roughness={0.9} /></mesh>
    {points.slice(0, Math.max(0, lit - 1)).map((point, index) => <LitPath key={index} a={point} b={points[index + 1]!} />)}
    {points.map((point, index) => <Bulb key={index} point={point} index={index} lit={index < lit} next={index === lit} reducedMotion={reducedMotion} />)}
    {[-1, 1].map((side) => <group key={side} position={[side * 3.55, 0, -3.7]}>
      {[0, 1, 2].map((i) => <mesh key={i} position={[side * (i * 0.16), 0.1 + i * 0.09, i * 0.35]} scale={[0.36 - i * 0.06, 0.24, 0.23]} rotation={[0, 0, side * 0.45]}>
        <sphereGeometry args={[1, 10, 8]} /><meshStandardMaterial color={i % 2 ? '#4F8064' : '#6D9470'} roughness={0.96} />
      </mesh>)}
    </group>)}
  </>;
}

export const LightsGame3D = memo(function LightsGame3D(props: GameProps) {
  const controller = useMemo<SceneController>(() => ({ camera: null }), []);
  const points = CONSTELLATIONS[props.variation % CONSTELLATIONS.length]!;
  const count = useRef(0);
  const previous = useRef<Point | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lit, setLit] = useState(0);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); controller.camera = null; }, [controller]);
  const move = (point: Point, start: boolean) => {
    if (count.current >= points.length) return;
    const from = start || !previous.current ? point : previous.current;
    previous.current = point;
    const next = lightSegment(points, count.current, from, point);
    if (next === count.current) return;
    count.current = next;
    setLit(next);
    props.onProgress(Math.floor(next / points.length * 100));
    if (next === points.length) timer.current = setTimeout(props.onComplete, props.reducedMotion ? 0 : 1000);
  };
  return <SceneFrame controller={controller} enabled={props.enabled} background="#DDE6DC" cameraPosition={[-2.4, 13, 12]} fov={51} label="Pequenas lanternas em um jardim noturno. Acenda os pontos na ordem indicada." onPoint={move} onEnd={() => { previous.current = null; }}>
    <NightScene points={points} lit={lit} reducedMotion={props.reducedMotion} complete={lit === points.length} />
  </SceneFrame>;
});
