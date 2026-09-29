import { Blossom, Motes, Pebble, Plant, Shelf, SoftBox, Vessel } from '../three/Diorama';

export function GreenhouseEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    {Array.from({ length: 12 }, (_, i) => <SoftBox key={i} size={[7.7, .06, .8]} position={[0, -.14, -4.5 + i * .82]} color={i % 2 ? '#DFD6B8' : '#E9DEC2'} radius={.025} />)}
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.16, 2.4, .18]} position={[s * 3.6, 1, -4.75]} color="#87A89B" />
      <SoftBox size={[.12, 1.7, .13]} position={[s * 2, .66, -4.75]} color="#A6BFA9" />
      <Plant position={[s * 3.4, -.1, 3.5]} scale={.75} pot="#D3AD83" reducedMotion={reducedMotion} />
    </group>)}
    <SoftBox size={[7.35, .16, .2]} position={[0, 2.2, -4.75]} color="#87A89B" />
    <SoftBox size={[7.3, .1, .13]} position={[0, .75, -4.75]} color="#A6BFA9" />
    <Shelf position={[0, .78, -4.6]} width={6.8} />
    {[-2.7, -1.4, .1, 1.4, 2.7].map((x, i) => i % 2 ? <Plant key={x} position={[x, .85, -4.56]} scale={.65} pot="#B9B994" flowers reducedMotion={reducedMotion} /> : <Vessel key={x} position={[x, .85, -4.56]} scale={.65} color={i ? '#C7A17D' : '#E3BA94'} />)}
    {[-1, 1].map(s => <group key={s} position={[s * 3.35, -.13, -.6]}>
      <Pebble scale={[.4, .1, .7]} color="#829568" />
      <Blossom position={[0, .16, -.15]} scale={.7} color="#F1D7A2" />
      <Blossom position={[s * .12, .12, .32]} scale={.55} color="#DFA596" />
    </group>)}
    <Motes count={15} reducedMotion={reducedMotion} />
  </>;
}
