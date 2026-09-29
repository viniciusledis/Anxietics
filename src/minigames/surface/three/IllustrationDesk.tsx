import { Blossom, Motes, Plant, RoomShell, SoftBox, Vessel } from '../../three/Diorama';

export function IllustrationDesk({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <RoomShell color="#E7DCC4" wood="#AB825E" />
    <SoftBox size={[7.2, .15, 9.6]} position={[0, -.08, 0]} color="#B88E62" radius={.25} />
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.18, .23, 9.5]} position={[s * 3.46, .14, 0]} color="#E1BC80" />
      <SoftBox size={[6.98, .23, .18]} position={[0, .14, s * 4.68]} color="#D2A871" />
    </group>)}
    <Plant position={[-3.4, -.1, -4.5]} scale={.9} flowers reducedMotion={reducedMotion} />
    <Vessel position={[3.45, -.1, -4.4]} scale={.8} color="#98AFA4" glaze />
    {[0, 1, 2].map(i => <SoftBox key={i} size={[.07, 1.02 + i * .12, .07]} position={[3.34 + i * .1, .68, -4.4]} rotation={[0, 0, (i - 1) * .13]} color={i % 2 ? '#D8AF68' : '#C78678'} radius={.025} />)}
    <group position={[-3.6, .05, 2.95]} rotation={[0, -.15, 0]}>
      <SoftBox size={[.47, .13, 1.2]} color="#AEC4AF" />
      {[0, 1, 2, 3].map(i => <mesh key={i} position={[0, .085, -.4 + i * .27]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.12, 16]} /><meshStandardMaterial color={['#D89A91', '#86AEA7', '#DAC277', '#A794B1'][i]} roughness={.35} /></mesh>)}
    </group>
    {[-2.8, 2.8].map((x, i) => <Blossom key={x} position={[x, .32, 4.1]} scale={.6} color={i ? '#E4BA80' : '#DAA18D'} />)}
    <Motes count={12} reducedMotion={reducedMotion} />
  </>;
}
