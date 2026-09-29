import { Motes, Pebble, Plant, RoomShell, Shelf, SoftBox, Vessel } from '../../three/Diorama';

export function ClayStudio({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <RoomShell color="#E7D5BC" wood="#B18A65" />
    <Shelf position={[-.35, .9, -4.85]} width={5.9} />
    {[-2.5, -.9, .9, 2.4].map((x, i) => <Vessel key={x} position={[x, .98, -4.75]} scale={i % 2 ? .9 : .65} color={['#C8977B', '#E4CBA6', '#87AAA1', '#DAAC8D'][i]} glaze={i === 2} />)}
    <SoftBox size={[7.1, .06, 9.55]} position={[0, .08, 0]} color="#D5B999" radius={.4} />
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.22, .25, 8.9]} position={[s * 3.6, .02, 0]} color="#B28B64" />
      <SoftBox size={[7.3, .25, .22]} position={[0, .02, s * 4.6]} color="#C49D73" />
    </group>)}
    <Plant position={[-3.45, -.1, 3.85]} scale={.8} pot="#C5AD88" reducedMotion={reducedMotion} />
    <group position={[3.45, .22, 2.75]} rotation={[0, -.15, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[.15, .15, 1.5, 24]} /><meshStandardMaterial color="#D9BA8C" roughness={.62} /></mesh>
      {[-1, 1].map(s => <Pebble key={s} position={[0, 0, s * .94]} scale={[.11, .11, .27]} color="#AD805B" />)}
    </group>
    <Vessel position={[-3.4, -.1, -3.8]} scale={.65} color="#A2B5AA" glaze />
    {Array.from({ length: 11 }, (_, i) => <Pebble key={i} position={[3.34 + Math.sin(i * 2.4) * .25, .05, -3.5 + i * .21]} scale={[.05 + i % 3 * .02, .05, .06]} color={i % 2 ? '#D8AD91' : '#C3967D'} />)}
    <Motes count={10} reducedMotion={reducedMotion} />
  </>;
}
