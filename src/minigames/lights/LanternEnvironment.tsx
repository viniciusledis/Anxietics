import { Motes, Pebble, Plant, SoftBox } from '../three/Diorama';

export function LanternEnvironment({ reducedMotion, complete }: { reducedMotion: boolean; complete: boolean }) {
  return <>
    <SoftBox size={[8.2, .55, 10.6]} position={[0, -.52, 0]} color="#556E6A" radius={.3} />
    <SoftBox size={[7.9, .16, 10.3]} position={[0, -.19, 0]} color="#284E53" radius={.28} />
    {Array.from({ length: 9 }, (_, i) => <SoftBox key={i} size={[.66, .09, .5]} position={[-3.15 + i % 3 * .23, -.065, -4.35 + i * 1.05]} color={i % 2 ? '#4A6D70' : '#3E6264'} rotation={[0, .2, 0]} />)}
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.18, 2.35, .18]} position={[s * 3.5, .95, -4.45]} color="#697A6A" />
      <Plant position={[s * 3.35, -.1, -3.7]} scale={1.2} pot="#487476" reducedMotion={reducedMotion} />
      <Plant position={[s * 3.45, -.1, 3.65]} scale={.8} pot="#8E9270" reducedMotion={reducedMotion} />
      {[0, 1, 2].map(i => <Pebble key={i} position={[s * (3.6 - i * .13), -.02, 2.75 + i * .3]} scale={[.24, .12, .3]} color="#64827A" />)}
    </group>)}
    <SoftBox size={[7.25, .2, .24]} position={[0, 2.1, -4.45]} color="#738675" />
    {Array.from({ length: 11 }, (_, i) => <group key={i} position={[-3.1 + i * .62, 1.9 - Math.sin(i / 10 * Math.PI) * .28, -4.42]}>
      <SoftBox size={[.022, .22, .025]} position={[0, .06, 0]} color="#7C8465" radius={.005} />
      <mesh position={[0, -.11, 0]}><sphereGeometry args={[.095, 12, 8]} /><meshStandardMaterial color="#FFE4A2" emissive="#F8BC59" emissiveIntensity={complete ? 2.5 : .9} /></mesh>
    </group>)}
    <pointLight position={[0, 1.3, -4]} color="#FFD28A" intensity={complete ? 13 : 7} distance={7} decay={2} />
    <Motes color="#EEDC99" count={30} reducedMotion={reducedMotion} />
  </>;
}
