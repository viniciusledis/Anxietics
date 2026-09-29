import { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { Group, MathUtils } from 'three';
import { Blossom, Pebble, SoftBox } from '../../three/Diorama';
import { RoundedBoard } from '../../three/RoundedBoard';

/** The illustration becomes a little paper-theatre at completion. Coverage stays flat. */
export function RevealedRelief({ variation, complete, reducedMotion }: { variation: number; complete: boolean; reducedMotion: boolean }) {
  const relief = useRef<Group>(null);
  useFrame((_, delta) => { if (relief.current) relief.current.scale.y = MathUtils.damp(relief.current.scale.y, complete ? .85 : .07, reducedMotion ? 60 : 5, Math.min(delta, .05)); });
  const kind = variation % 3;
  return <>
    <RoundedBoard width={8.1} depth={10.6} height={.33} position={[0, -.25, 0]} color="#C9A67E" />
    <RoundedBoard width={6.6} depth={9.1} height={.06} position={[0, -.045, 0]} color="#F5E8CF" />
    <group ref={relief} scale={[1, .07, 1]}>
      <Pebble position={[0, -.02, .3]} scale={[2.75, .14, 3.5]} color={kind === 1 ? '#9BC8C6' : '#B7C49A'} />
      {kind === 0 ? <>
        <SoftBox size={[2.3, 1.55, 2]} position={[.25, .8, -.6]} color="#E6BE99" radius={.12} />
        <group position={[.25, 1.64, -.6]} rotation={[0, Math.PI / 4, 0]}><mesh castShadow scale={[1.8, .85, 1.6]}><coneGeometry args={[1, 1, 4]} /><meshStandardMaterial color="#9B7C65" roughness={.85} /></mesh></group>
        <SoftBox size={[.48, .9, .14]} position={[.25, .47, .43]} color="#75968A" radius={.12} />
        {[-.55, 1.02].map(x => <group key={x}><SoftBox size={[.43, .45, .11]} position={[x, .95, .44]} color="#F5DB97" /><SoftBox size={[.035, .46, .05]} position={[x, .95, .51]} color="#F2E6C9" /></group>)}
        {[0, 1, 2, 3].map(i => <Pebble key={i} position={[.25 + Math.sin(i) * .2, .1, .8 + i * .47]} scale={[.28, .065, .2]} color="#E3D0AA" />)}
      </> : kind === 1 ? <>
        <Pebble position={[0, .36, .4]} scale={[1.5, .4, .62]} color="#AE825D" />
        <SoftBox size={[2.6, .11, .8]} position={[0, .54, .4]} color="#E5C697" radius={.2} />
        <SoftBox size={[.08, 2.3, .08]} position={[0, 1.4, .4]} color="#897354" />
        <mesh position={[.64, 1.55, .4]} rotation={[0, 0, -.14]} scale={[1.4, 1.7, .06]} castShadow><coneGeometry args={[.62, 1, 3]} /><meshStandardMaterial color="#F8EAD0" roughness={.95} /></mesh>
        <mesh position={[-.43, 1.32, .4]} rotation={[0, 0, .2]} scale={[.8, 1.3, .06]} castShadow><coneGeometry args={[.62, 1, 3]} /><meshStandardMaterial color="#D99785" roughness={.9} /></mesh>
        {[-1, 1].map(s => <mesh key={s} position={[s * 1.65, .08, 1.1]} rotation={[-Math.PI / 2, 0, .2]} scale={[.8, .28, 1]}><torusGeometry args={[.7, .025, 6, 40, Math.PI]} /><meshStandardMaterial color="#E2F0DB" /></mesh>)}
      </> : <group position={[0, .4, -.2]}>
        {[-1, 1].map(s => <group key={s} rotation={[0, 0, complete ? s * .2 : 0]}>
          <Pebble position={[s * .88, .4, -.55]} scale={[.88, .16, 1.25]} color={s > 0 ? '#BE9CBA' : '#E2B16E'} rotation={[0, s * .25, 0]} />
          <Pebble position={[s * .68, .3, 1.02]} scale={[.69, .13, .76]} color={s > 0 ? '#D4B3CC' : '#E9CA8F'} />
          {[-.3, .15, .6].map(z => <Pebble key={z} position={[s * .9, .58, z]} scale={[.17, .055, .22]} color="#F3E6C6" />)}
        </group>)}
        <Pebble position={[0, .45, .15]} scale={[.17, .18, 1.25]} color="#617C65" />
        <Pebble position={[0, .49, -1.04]} scale={[.23, .22, .25]} color="#718B6B" />
      </group>}
      {[-1, 1].map(s => <group key={s} position={[s * 2.25, .12, -2.3]}>
        <SoftBox size={[.18, 1.1, .2]} position={[0, .55, 0]} color="#A7875F" />
        <Pebble position={[0, 1.15, 0]} scale={[.65, .85, .65]} color="#648C62" />
        {Array.from({ length: 8 }, (_, i) => <Pebble key={i} position={[Math.sin(i * 2.4) * .4, 1.3 + Math.cos(i * 2.4) * .42, Math.cos(i * 3) * .4]} scale={[.23, .14, .27]} color={i % 2 ? '#89A869' : '#759959'} />)}
      </group>)}
      {Array.from({ length: 12 }, (_, i) => <Blossom key={i} position={[Math.sin(i * 2.4) * 2.3, .2, 2.45 + Math.cos(i * 2.4) * .48]} scale={.65} color={i % 2 ? '#E8AF98' : '#F4DFAD'} />)}
    </group>
  </>;
}
