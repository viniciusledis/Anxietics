import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group } from 'three';
import { Motes, Pebble, Plant, SoftBox } from '../three/Diorama';

export function ZenEnvironment({ reducedMotion, complete }: { reducedMotion: boolean; complete: boolean }) {
  const bamboo = useRef<Group>(null);
  useFrame(({ clock }) => { if (bamboo.current && !reducedMotion) bamboo.current.rotation.z = Math.sin(clock.elapsedTime * .6) * .014; });
  return <>
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.25, .42, 10.25]} position={[s * 3.95, -.1, 0]} color="#A77751" radius={.09} />
      <SoftBox size={[7.85, .42, .25]} position={[0, -.1, s * 5]} color="#BC9066" radius={.09} />
      <SoftBox size={[.06, .02, 9.8]} position={[s * 3.88, .12, 0]} color="#DEC29A" radius={.01} />
    </group>)}
    <group position={[-2.85, -.15, -3.65]}>
      <Pebble scale={[.9, .12, 1.02]} color="#789468" />
      <Pebble position={[0, .25, 0]} scale={[.66, .38, .57]} color="#8D9B91" rotation={[0, .4, .12]} />
      <Pebble position={[.12, .66, -.04]} scale={[.43, .23, .37]} color="#BDC5B0" />
      <Pebble position={[.13, .92, -.01]} scale={[.26, .13, .22]} color="#E0D5BE" />
      {[0, 1, 2].map(i => <mesh key={i} position={[0, .012, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[1.05 + i * .13, .018, 5, 64]} /><meshStandardMaterial color="#C9AB7E" roughness={1} /></mesh>)}
    </group>
    <group ref={bamboo} position={[3.15, -.1, -4.05]}>
      {[0, 1, 2].map(i => <group key={i} position={[(i - 1) * .24, 0, (i % 2) * .22]}>
        <SoftBox size={[.14, 1.7 + i * .25, .14]} position={[0, .85, 0]} color={i % 2 ? '#799466' : '#91A574'} radius={.06} />
        {[0, 1, 2, 3].map(j => <mesh key={j} position={[0, .3 + j * .4, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.081, .015, 5, 12]} /><meshStandardMaterial color="#C2C698" /></mesh>)}
        <Pebble position={[.17, 1.65 + i * .1, 0]} scale={[.35, .055, .11]} rotation={[0, i, .4]} color="#477A51" />
        <Pebble position={[-.17, 1.3 + i * .15, .03]} scale={[.3, .05, .1]} rotation={[0, i, -.4]} color="#71915B" />
      </group>)}
    </group>
    <Plant position={[-3.4, -.12, 4.05]} scale={.8} pot="#BFA786" reducedMotion={reducedMotion} />
    <group position={[3.15, -.1, 4.05]}>
      <Pebble scale={[.45, .12, .48]} color="#7C9680" />
      <mesh position={[0, .22, 0]}><cylinderGeometry args={[.2, .23, .4, 24]} /><meshStandardMaterial color="#F1DAB0" roughness={.9} /></mesh>
      <mesh position={[0, .45, 0]} scale={[.045, .12, .045]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#FFE8A5" emissive="#FFBB5A" emissiveIntensity={complete ? 2 : .5} /></mesh>
    </group>
    <Motes count={12} reducedMotion={reducedMotion} color="#EEDCB1" />
  </>;
}
