import { Blossom, Motes, Pebble, Plant, SoftBox } from '../three/Diorama';

export function NurseryEnvironment({ reducedMotion }: { reducedMotion: boolean }) {
  return <>
    {[-1, 1].map(s => <group key={s}>
      {Array.from({ length: 7 }, (_, i) => <group key={i} position={[s * 3.65, -.12, -3.8 + i * 1.28]}>
        <Pebble scale={[.36, .18, .38]} color={i % 2 ? '#D4C4A6' : '#B9BBA0'} />
        <Pebble position={[s * .1, .18, .1]} scale={[.17, .045, .34]} rotation={[0, i, .4]} color="#749956" />
        {i % 2 === 0 && <Blossom position={[0, .32, 0]} scale={.68} color={s > 0 ? '#F3D48B' : '#F0B5A0'} />}
      </group>)}
    </group>)}
    {Array.from({ length: 11 }, (_, i) => <SoftBox key={i} size={[.14, .85, .13]} position={[-3.4 + i * .68, .24, -4.85]} color={i % 2 ? '#CFB287' : '#E7CEAA'} radius={.065} />)}
    <SoftBox size={[7.3, .1, .13]} position={[0, .22, -4.86]} color="#C6A57D" />
    <SoftBox size={[7.3, .1, .13]} position={[0, .52, -4.86]} color="#DDBD93" />
    <Plant position={[-2.95, -.1, -4.35]} scale={1.2} flowers reducedMotion={reducedMotion} />
    <Plant position={[3, -.1, -4.4]} scale={.85} pot="#91AEA0" reducedMotion={reducedMotion} />
    {Array.from({ length: 7 }, (_, i) => <Pebble key={i} position={[Math.sin(i * .8) * .1, -.075, -3.8 + i * 1.17]} scale={[.37, .065, .39]} color={i % 2 ? '#DFD6B9' : '#CEC4A5'} />)}
    <Motes count={18} color="#F6DB9F" reducedMotion={reducedMotion} />
  </>;
}
