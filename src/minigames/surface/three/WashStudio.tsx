import { Motes, Pebble, Plant, RoomShell, SoftBox, Vessel } from '../../three/Diorama';

export function WashStudio({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <RoomShell color="#C5DAD2" wood="#9CAF9F" tiles />
    <SoftBox size={[6.4, .12, 8.1]} position={[0, -.08, .15]} color="#EDF0DE" radius={.7} roughness={.26} />
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.15, .2, 8]} position={[s * 3.15, .06, .1]} color="#E7EAD9" radius={.07} roughness={.25} />
      <SoftBox size={[6.3, .2, .16]} position={[0, .06, s * 3.85]} color="#E7EAD9" radius={.07} roughness={.25} />
    </group>)}
    <group position={[2.7, 0, -4.25]}>
      <mesh position={[0, .47, 0]} castShadow><cylinderGeometry args={[.1, .13, .94, 20]} /><meshStandardMaterial color="#C4AB79" metalness={.45} roughness={.3} /></mesh>
      <mesh position={[-.29, .95, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><torusGeometry args={[.3, .095, 12, 32, Math.PI]} /><meshStandardMaterial color="#C4AB79" metalness={.45} roughness={.3} /></mesh>
      <SoftBox size={[.3, .08, .16]} position={[.22, .48, 0]} color="#A89472" roughness={.3} />
    </group>
    <Plant position={[-3.15, -.1, -4.15]} scale={1} pot="#B3C6B4" reducedMotion={reducedMotion} />
    <group position={[3.3, .05, 3.8]} rotation={[0, -.2, 0]}>
      <SoftBox size={[1, .14, 1.3]} color="#A8BCA6" radius={.12} />
      {[0, 1, 2].map(i => <SoftBox key={i} size={[.8, .025, .035]} position={[0, .08, -.4 + i * .16]} color="#D7DFCE" />)}
      <Pebble position={[.05, .16, .14]} scale={[.29, .09, .2]} color="#EBDAB2" roughness={.5} />
    </group>
    <Vessel position={[-3.35, -.1, 3.6]} scale={.7} color="#8BB0B0" glaze />
    <Motes color="#DAEEE5" count={12} reducedMotion={reducedMotion} />
  </>;
}
