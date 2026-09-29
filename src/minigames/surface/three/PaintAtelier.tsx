import { Motes, Pebble, Plant, RoomShell, Shelf, SoftBox, Vessel } from '../../three/Diorama';

export function PaintAtelier({ reducedMotion }: { reducedMotion: boolean }) {
  const pigments = ['#CB9096', '#91AE94', '#B8A1BF'];
  return <>
    <RoomShell color="#E8DEC8" wood="#B28A62" />
    <Shelf position={[-.5, 1, -4.85]} width={5.4} />
    {pigments.map((c, i) => <group key={c} position={[-2.1 + i * 1.5, 1.07, -4.73]}>
      <Vessel color="#E8D6B5" scale={.75} glaze />
      <Pebble position={[0, .43, 0]} scale={[.26, .045, .26]} color={c} roughness={.25} />
      <SoftBox size={[.045, .72, .045]} position={[.06, .7, 0]} rotation={[0, 0, -.16]} color="#B88958" />
    </group>)}
    <Plant position={[3.4, -.1, -4.2]} scale={.85} pot="#9EB7A0" reducedMotion={reducedMotion} />
    <group position={[-3.4, .04, 3.45]} rotation={[0, -.3, 0]}>
      <Pebble scale={[.52, .08, .72]} color="#C8A676" />
      {pigments.map((c, i) => <Pebble key={c} position={[.15 * Math.sin(i * 2), .085, -.38 + i * .32]} scale={[.17, .045, .15]} color={c} roughness={.22} />)}
      <SoftBox size={[.055, .07, 1.1]} position={[-.23, .1, 0]} color="#876E51" rotation={[0, -.25, 0]} />
    </group>
    <group position={[3.45, .04, 3.55]} rotation={[0, .18, 0]}>
      <SoftBox size={[.58, .13, 1.45]} color="#789489" />
      <SoftBox size={[.43, .06, .7]} position={[0, .07, -.2]} color="#CF959B" roughness={.28} />
      {[0, 1, 2].map(i => <SoftBox key={i} size={[.4, .02, .03]} position={[0, .077, .23 + i * .12]} color="#AFC1AB" />)}
    </group>
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.22, .22, 9.5]} position={[s * 3.45, .12, 0]} color="#DABB8E" radius={.06} />
      <SoftBox size={[7, .22, .22]} position={[0, .12, s * 4.67]} color="#DABB8E" radius={.06} />
    </group>)}
    <Motes count={10} reducedMotion={reducedMotion} />
  </>;
}
