import { Blossom, Motes, Pebble, Plant, SoftBox } from '../../three/Diorama';

export function WindowSurround({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    <SoftBox size={[8.7, .35, 11]} position={[0, -.45, 0]} color="#C7AC87" radius={.3} />
    <SoftBox size={[8.6, .27, .7]} position={[0, .4, 5.06]} color="#E9D7B5" radius={.12} />
    {[-1, 1].map(s => <group key={s}>
      <SoftBox size={[.32, .48, 10.35]} position={[s * 3.81, .37, 0]} color="#F1E5CA" radius={.1} />
      <SoftBox size={[.09, .06, 9.95]} position={[s * 3.58, .51, 0]} color="#BBA580" />
      {Array.from({ length: 5 }, (_, i) => <Pebble key={i} position={[s * (4.02 + i * .12), .48, -1.5]} scale={[.12, .18 + i % 2 * .08, 3.1]} color={i % 2 ? '#ABC1B1' : '#C8D5BD'} />)}
      <SoftBox size={[.67, .12, .2]} position={[s * 4.12, .7, -.5]} color="#D4B67E" radius={.06} />
      <Plant position={[s * 3.05, .5, 4.82]} scale={.95} pot={s > 0 ? '#B89979' : '#9DB8A5'} flowers reducedMotion={reducedMotion} />
    </group>)}
    <SoftBox size={[8, .3, .34]} position={[0, .44, -5.04]} color="#E6D2AE" radius={.1} />
    <SoftBox size={[.1, .15, 9.9]} position={[0, .44, 0]} color="#DFCEAE" />
    <SoftBox size={[7.6, .16, .1]} position={[0, .45, 0]} color="#E4D6B7" />
    {Array.from({ length: 9 }, (_, i) => <Blossom key={i} position={[-2.7 + i * .68, .14, 3.8 + Math.sin(i) * .12]} scale={.65} color={i % 2 ? '#F5D88B' : '#EBA794'} />)}
    <Motes color="#FFF0C6" count={16} reducedMotion={reducedMotion} />
  </>;
}
