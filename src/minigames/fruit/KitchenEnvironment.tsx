import { Motes, Plant, RoomShell, Shelf, SoftBox, Vessel, Pebble } from '../three/Diorama';

export function KitchenEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <RoomShell color="#E4DFC8" tiles />
    <Shelf position={[-1.3, 1.05, -4.75]} width={4.3} />
    {[-2.8, -1.9, -1].map((x, i) => <group key={x} position={[x, 1.12, -4.78]}>
      <Vessel scale={.65} color={['#81A69A', '#F3DCB6', '#DCA080'][i]} glaze />
      <SoftBox size={[.3, .04, .3]} position={[0, .44, 0]} color="#A67750" />
    </group>)}
    <Plant position={[2.9, -.15, -4.1]} scale={1.25} pot="#E9C18D" reducedMotion={reducedMotion} />
    <SoftBox size={[5.8, .1, 7.6]} position={[0, -.14, -.15]} color="#CFA572" radius={.4} />
    {Array.from({ length: 11 }, (_, i) => <SoftBox key={i} size={[.012, .006, 7.1]} position={[-2.6 + i * .52, -.086, -.15]} color={i % 2 ? '#DDBB8B' : '#C39866'} radius={.003} />)}
    <group position={[-2.9, -.12, 4.12]} rotation={[0, -.24, 0]}>
      <SoftBox size={[1.4, .08, 1.35]} color="#B5C8B2" />
      {[-.45, -.15, .15, .45].map(x => <SoftBox key={x} size={[.055, .012, 1.3]} position={[x, .048, 0]} color="#E8EBD7" />)}
      <Vessel position={[.1, .04, 0]} color="#FFF0D9" scale={.8} glaze />
    </group>
    <group position={[2.85, 0, 3.9]} rotation={[0, .35, 0]}>
      <SoftBox size={[.16, .12, .9]} position={[0, 0, .35]} color="#446D59" />
      <SoftBox size={[.35, .06, .92]} position={[.09, 0, -.45]} color="#CAD8CF" roughness={.3} />
      <Pebble position={[.52, .03, .4]} scale={[.17, .045, .3]} color="#739651" />
    </group>
    <Motes count={10} reducedMotion={reducedMotion} />
  </>;
}
