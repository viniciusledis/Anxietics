import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group } from 'three';
import { Motes, Plant, RoomShell, Shelf, SoftBox, Vessel } from '../three/Diorama';

export function MarblingEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  const highlights = useRef<Group>(null);
  useFrame(({ clock }) => { if (highlights.current && !reducedMotion) highlights.current.position.x = Math.sin(clock.elapsedTime * .45) * .06; });
  return <>
    <RoomShell color="#DBE4DA" wood="#A88869" />
    <Shelf position={[-.3, 1, -4.9]} width={4.5} />
    {['#D391A0', '#7CAAC1', '#DBBF72'].map((c, i) => <group key={c} position={[-1.8 + i * 1.08, 1.07, -4.77]}>
      <Vessel color={c} scale={.72} glaze />
      <SoftBox size={[.26, .15, .26]} position={[0, .51, 0]} color="#B89069" />
    </group>)}
    <Plant position={[3.15, -.1, -3.95]} scale={1.1} pot="#DBBF95" reducedMotion={reducedMotion} />
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.2, .38, 8.9]} position={[s * 3.43, .03, .05]} color="#ECEBD8" radius={.09} roughness={.3} />
      <SoftBox size={[6.9, .38, .22]} position={[0, .03, s * 4.37]} color="#ECEBD8" radius={.09} roughness={.3} />
    </group>)}
    <group ref={highlights}>
      {[0, 1, 2].map(i => <mesh key={i} position={[-2.8 + i * .15, .04, -2.5 + i * .8]} rotation={[-Math.PI / 2, 0, -.18]} scale={[.04, .45, 1]}><circleGeometry args={[1, 24]} /><meshBasicMaterial color="#EEF8DF" transparent opacity={.55} depthWrite={false} /></mesh>)}
      <mesh position={[2.55, .037, 2.8]} rotation={[-Math.PI / 2, 0, .2]} scale={[.06, .85, 1]}><circleGeometry args={[1, 24]} /><meshBasicMaterial color="#F6F6DF" transparent opacity={.35} depthWrite={false} /></mesh>
    </group>
    <group position={[-3.5, .13, 3.3]} rotation={[0, -.22, 0]}>
      <SoftBox size={[.08, .09, 1.9]} color="#9D7250" radius={.035} />
      <SoftBox size={[.14, .12, .4]} position={[0, 0, -.87]} color="#627A6B" />
    </group>
    <Motes count={9} reducedMotion={reducedMotion} />
  </>;
}
