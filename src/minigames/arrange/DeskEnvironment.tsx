import { Motes, Pebble, Plant, RoomShell, Shelf, SoftBox, Vessel } from '../three/Diorama';

export function DeskEnvironment({ balls, reducedMotion }: { balls: boolean; reducedMotion: boolean }) {
  return <>
    <RoomShell color={balls ? '#EDE0C6' : '#D8DFCF'} wood={balls ? '#B78E69' : '#A68566'} />
    <SoftBox size={[6.6, .05, 7.8]} position={[0, -.13, .05]} color={balls ? '#E5CFA8' : '#C5CDB9'} radius={.4} />
    {Array.from({ length: 15 }, (_, i) => <SoftBox key={i} size={[.035, .012, .16]} position={[-3 + i * .43, -.09, 3.8]} color="#F5ECD6" radius={.01} />)}
    <Shelf position={[1.4, .9, -4.85]} width={3.9} />
    <Plant position={[-3.05, -.14, -4.15]} scale={1.3} pot={balls ? '#A4B89B' : '#D8BA95'} reducedMotion={reducedMotion} />
    {balls ? <>
      {[0, 1, 2].map(i => <SoftBox key={i} size={[.52, .55, .52]} position={[.1 + i * .62, 1.22, -4.8]} rotation={[0, i * .15, 0]} color={['#DB9E91', '#8EAE9B', '#E6C271'][i]!} radius={.11} />)}
      <group position={[3.4, .05, 2.3]} rotation={[0, -.2, 0]}>{[0, 1, 2].map(i => <mesh key={i} position={[0, i * .13, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.26 - i * .045, .06, 10, 24]} /><meshStandardMaterial color={['#D7A189', '#D5BC79', '#86A89D'][i]} roughness={.55} /></mesh>)}</group>
    </> : <>
      {[0, 1, 2].map(i => <SoftBox key={i} size={[.65, .15, .46]} position={[.35, 1.03 + i * .15, -4.7]} color={['#779C8A', '#E4CCA0', '#BA8F78'][i]!} rotation={[0, i * .13, 0]} />)}
      <Vessel position={[2.5, .98, -4.7]} scale={.65} color="#A0B5AB" glaze />
      <group position={[2.9, -.05, 4.15]} rotation={[0, -.4, 0]}>
        <SoftBox size={[1.1, .09, 1.15]} color="#F2E8D1" />
        {[-.3, -.1, .1, .3].map(z => <SoftBox key={z} size={[.65, .012, .018]} position={[-.04, .054, z]} color="#B8C1A9" radius={.005} />)}
        <SoftBox size={[.065, .07, 1.05]} position={[.42, .08, 0]} rotation={[0, .18, 0]} color="#B88D59" />
      </group>
      <Pebble position={[-3.2, 0, 3.95]} scale={[.4, .21, .3]} color="#A6ADA2" />
      <Pebble position={[-3.05, .31, 3.9]} scale={[.28, .13, .23]} color="#D1BEA3" />
    </>}
    <Motes count={9} reducedMotion={reducedMotion} />
  </>;
}
