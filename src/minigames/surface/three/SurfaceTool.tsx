import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group, MathUtils } from 'three';
import { GAME_INFO } from '../../definitions';
import { Point } from '../../grass/coverage';
import { worldPoint } from '../../three/SceneFrame';
import { GameId } from '../../types';
import { CompletionDolly, SoftBox } from '../../three/Diorama';

export function SurfaceTool({ game, pointer, touching, color, reducedMotion }: {
  game: GameId; pointer: Point; touching: boolean; color: number; reducedMotion: boolean;
}) {
  const model = useRef<Group>(null);
  const [x, , z] = worldPoint(pointer);
  useFrame((_, delta) => {
    if (!model.current) return;
    const t = Math.min(delta, 0.05);
    model.current.position.x = MathUtils.damp(model.current.position.x, x, reducedMotion ? 45 : 28, t);
    model.current.position.z = MathUtils.damp(model.current.position.z, z, reducedMotion ? 45 : 28, t);
    model.current.position.y = MathUtils.damp(model.current.position.y, game === 'wash' ? 0.9 : touching ? 0.5 : 0.65, 10, t);
    model.current.rotation.z = MathUtils.damp(model.current.rotation.z, touching ? -0.08 : 0.08, 8, t);
  });
  const [sx, , sz] = worldPoint({ x: 160, y: 320 });
  return <group ref={model} position={[sx, 0.65, sz]}>
    {game === 'window' ? <>
      <SoftBox size={[.98, .23, .62]} color="#7297A0" radius={.1} roughness={.95} />
      {[-0.22, 0, 0.22].map((z) => <mesh key={z} position={[0, 0.1, z]} scale={[0.67, 0.025, 0.045]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#CAE1DD" roughness={0.9} /></mesh>)}
      <mesh position={[0, 0.13, 0]} scale={[0.28, 0.12, 0.24]}><sphereGeometry args={[1, 10, 6]} /><meshStandardMaterial color="#4F7777" roughness={0.88} /></mesh>
    </> : game === 'wash' ? <>
      <mesh position={[0, 0.24, 0]} scale={[0.24, 0.52, 0.24]}><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color="#668F96" roughness={0.76} /></mesh>
      <mesh position={[0, -0.07, 0]} scale={[0.29, 0.12, 0.29]}><cylinderGeometry args={[1, 1, 1, 12]} /><meshStandardMaterial color="#A7CDD0" roughness={0.61} /></mesh>
      <mesh position={[0, 0.5, 0]} scale={[0.36, 0.14, 0.3]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#789FA1" roughness={0.78} /></mesh>
      {touching && [-1, 0, 1].map((i) => <mesh key={i} position={[i * 0.17, -0.38 - (i % 2) * 0.1, 0.08]} scale={[0.045, 0.11, 0.045]}><sphereGeometry args={[1, 6, 5]} /><meshStandardMaterial color="#BCE5E4" roughness={0.35} /></mesh>)}
    </> : game === 'paint' ? <>
      <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.26, 0.96, 0.26]}><cylinderGeometry args={[1, 1, 1, 16]} /><meshStandardMaterial color={GAME_INFO.paint.colors![color]} roughness={0.84} /></mesh>
      <mesh position={[0.6, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.055, 0.46, 0.055]}><cylinderGeometry args={[1, 1, 1, 7]} /><meshStandardMaterial color="#60736D" roughness={0.91} /></mesh>
      <mesh position={[0.83, 0.25, 0]} scale={[0.1, 0.38, 0.1]}><cylinderGeometry args={[1, 1, 1, 8]} /><meshStandardMaterial color="#A37553" roughness={0.88} /></mesh>
    </> : game === 'clay' ? <>
      <SoftBox position={[0, .04, -.1]} rotation={[.1, 0, 0]} size={[1.1, .12, .5]} color="#C8D0C3" roughness={.4} radius={.04} />
      <mesh position={[0, 0.38, 0.23]} rotation={[0.55, 0, 0]} scale={[0.19, 0.73, 0.19]}><cylinderGeometry args={[1, 1, 1, 8]} /><meshStandardMaterial color="#926D52" roughness={0.9} /></mesh>
    </> : <>
      <mesh position={[0, 0.03, -0.1]} scale={[0.9, 0.1, 0.44]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#F5E5C6" roughness={0.96} /></mesh>
      <mesh position={[0, 0.1, 0.1]} scale={[0.82, 0.08, 0.13]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#8EAC9A" roughness={0.92} /></mesh>
      <mesh position={[0, 0.37, 0.37]} rotation={[0.55, 0, 0]} scale={[0.16, 0.58, 0.16]}><cylinderGeometry args={[1, 1, 1, 8]} /><meshStandardMaterial color="#A57A58" roughness={0.91} /></mesh>
    </>}
  </group>;
}

export function SurfaceFinish({ game, reducedMotion }: { game: GameId; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, .05);
    if (group.current && !reducedMotion) {
      group.current.position.y = .6 + Math.sin(Math.min(1, elapsed.current) * Math.PI) * .28;
      group.current.scale.setScalar(1 + elapsed.current * .15);
    }
  });
  if (game === 'clay') return <directionalLight position={[5, 2, -3]} color="#F9D9AE" intensity={.55} />;
  if (game === 'paint' || game === 'reveal') return <CompletionDolly complete reducedMotion={reducedMotion} amount={game === 'paint' ? 1.2 : 2} />;
  return <group ref={group} position={[0, .6, 0]}>
    {(game === 'window' ? [-2.4, 1.9] : [-1.4, .1, 1.5]).map((x, i) => <group key={x} position={[x, i * .08, -.8 + i * .85]} rotation={[-Math.PI / 2, 0, .2]}>
      <mesh><planeGeometry args={[.045, .6]} /><meshBasicMaterial color="#FFF8DC" transparent opacity={.8} depthWrite={false} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><planeGeometry args={[.045, .4]} /><meshBasicMaterial color="#FFF8DC" transparent opacity={.8} depthWrite={false} /></mesh>
    </group>)}
  </group>;
}
