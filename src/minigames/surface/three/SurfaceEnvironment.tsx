import { GameId } from '../../types';
import { RoundedBoard } from '../../three/RoundedBoard';
import { Arrival, Pebble, SoftBox, StudioLight } from '../../three/Diorama';
import { WindowSurround } from './WindowSurround';
import { IllustrationDesk } from './IllustrationDesk';
import { WashStudio } from './WashStudio';
import { ClayStudio } from './ClayStudio';
import { PaintAtelier } from './PaintAtelier';
import { RevealedRelief } from './RevealedRelief';

function WindowWorld({ variation }: { variation: number }) {
  const skies = ['#C7E3E0', '#CFE3D7', '#EBCDC1'];
  return <>
    <RoundedBoard width={7.5} depth={10.2} height={0.2} position={[0, -0.17, 0]} color={skies[variation % 3]!} />
    <mesh position={[0, -0.035, 3.3]} scale={[7.3, 0.04, 3.2]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#8FBBC0" roughness={0.54} /></mesh>
    {[-2, -.65, .75, 2].map((x, i) => <mesh key={i} position={[x, .025, .5 + i % 2 * .35]} scale={[1.3, .14, 1.8]}><sphereGeometry args={[1, 24, 16]} /><meshStandardMaterial color={i % 2 ? '#9CB688' : '#7FA18A'} roughness={.9} /></mesh>)}
    {[-1.9, .5].map((x, i) => <group key={x} position={[x, .1, -3.5 + i * .5]}>
      <Pebble scale={[.65, .07, .23]} color="#F2F1DA" />
      <Pebble position={[-.19, .015, -.05]} scale={[.28, .075, .2]} color="#FAF5DE" />
      <Pebble position={[.16, .018, -.04]} scale={[.25, .075, .22]} color="#FAF5DE" />
    </group>)}
    {[0, 1, 2].map(i => <mesh key={i} position={[.6, .015, 3.3]} rotation={[-Math.PI / 2, 0, .2]} scale={[1.1, .22, 1]}><torusGeometry args={[.5 + i * .3, .02, 6, 40, Math.PI * 1.4]} /><meshStandardMaterial color="#CBE2D8" /></mesh>)}
    <mesh position={[1.7, 0.13, -2.9]} scale={[0.48, 0.07, 0.48]}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#F6DF9B" roughness={0.68} /></mesh>
    {[-2.5, 2.65].map((x, i) => <group key={i} position={[x, 0, 0.9 + i * 0.6]}>
      <mesh position={[0, 0.11, 0]} scale={[0.13, 0.18, 0.12]}><cylinderGeometry args={[1, 1, 1, 7]} /><meshStandardMaterial color="#8B7257" roughness={1} /></mesh>
      <mesh position={[0, 0.2, 0]} scale={[0.38, 0.12, 0.42]}><sphereGeometry args={[1, 10, 7]} /><meshStandardMaterial color="#477F62" roughness={1} /></mesh>
    </group>)}
    {[-3.85, 3.85].map((x) => <mesh key={x} position={[x, 0.42, 0]} scale={[0.26, 0.3, 10.65]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#F3EBD8" roughness={0.93} /></mesh>)}
    {[-5.05, 5.05].map((z) => <mesh key={z} position={[0, 0.42, z]} scale={[7.9, 0.3, 0.26]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#F3EBD8" roughness={0.93} /></mesh>)}
    <mesh position={[0, 0.42, 0]} scale={[0.15, 0.3, 10.1]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#F3EBD8" roughness={0.93} /></mesh>
  </>;
}

function RevealWorld({ variation }: { variation: number }) {
  return <>
    <RoundedBoard width={8.1} depth={10.6} height={0.33} position={[0, -0.25, 0]} color="#C9A67E" />
    <RoundedBoard width={7.6} depth={10.1} height={0.08} position={[0, -0.06, 0]} color="#F5E8CF" roughness={1} />
    <mesh position={[0, 0, 0.4]} scale={[2.5, 0.035, 2.6]}><cylinderGeometry args={[1, 1, 1, 28]} /><meshStandardMaterial color="#E8D7B9" roughness={1} /></mesh>
    {variation % 3 === 0 ? <>
      <mesh position={[0, 0.12, 1]} scale={[2.5, 0.22, 2.5]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#BB7E67" roughness={0.92} /></mesh>
      <mesh position={[0, 0.17, -0.65]} rotation={[0, Math.PI / 4, 0]} scale={[1.96, 0.2, 1.96]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#64836C" roughness={0.94} /></mesh>
      <mesh position={[0, 0.27, 1.5]} scale={[0.45, 0.05, 0.52]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#F3D69E" roughness={0.9} /></mesh>
    </> : variation % 3 === 1 ? <>
      <mesh position={[0, 0.12, 1.28]} scale={[3.2, 0.23, 0.75]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#98735C" roughness={0.93} /></mesh>
      <mesh position={[0, 0.18, -0.5]} scale={[0.08, 0.1, 3.7]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#5D715F" roughness={0.94} /></mesh>
      <mesh position={[-0.6, 0.19, -0.55]} rotation={[0, 0.3, 0]} scale={[1.1, 0.07, 1.95]}><coneGeometry args={[1, 0.1, 3]} /><meshStandardMaterial color="#FFF2DE" roughness={0.96} /></mesh>
    </> : <>
      {[-1, 1].map((side) => <group key={side}>
        <mesh position={[side * 0.85, 0.12, -0.7]} rotation={[0, side * 0.35, 0]} scale={[0.92, 0.16, 1.25]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={side < 0 ? '#E7B577' : '#B59BC1'} roughness={0.87} /></mesh>
        <mesh position={[side * 0.6, 0.16, 1.1]} rotation={[0, side * -0.35, 0]} scale={[0.68, 0.15, 0.82]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color={side < 0 ? '#E7B577' : '#B59BC1'} roughness={0.87} /></mesh>
      </group>)}
      <mesh position={[0, 0.23, 0.2]} scale={[0.13, 0.18, 1.28]}><sphereGeometry args={[1, 10, 7]} /><meshStandardMaterial color="#6A745D" roughness={0.95} /></mesh>
    </>}
    {[-3, 3].map((x) => <group key={x} position={[x, 0, 3.5]}>
      <mesh position={[0, 0.11, 0]} scale={[0.06, 0.18, 0.06]}><cylinderGeometry args={[1, 1, 1, 6]} /><meshStandardMaterial color="#71916C" roughness={1} /></mesh>
      <mesh position={[0, 0.22, 0]} scale={[0.17, 0.06, 0.17]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#E69F8D" roughness={0.9} /></mesh>
    </group>)}
  </>;
}

function WashWorld({ variation }: { variation: number }) {
  const vaseColor = ['#83B4BA', '#84AE96', '#D49B7F'][variation % 3]!;
  return <>
    <RoundedBoard width={8} depth={10.5} height={0.3} position={[0, -0.25, 0]} color="#D8E4DC" />
    <mesh position={[0, -0.05, 3.25]} scale={[7.6, 0.12, 2.3]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#B7C9BF" roughness={0.83} /></mesh>
    <mesh castShadow receiveShadow position={[0, 0.18, 0.9]} scale={[2.03, .65, 2.4]}><sphereGeometry args={[1, 48, 32]} /><meshPhysicalMaterial color={vaseColor} roughness={.26} clearcoat={.65} clearcoatRoughness={.2} /></mesh>
    <mesh position={[0, 0.26, -1.8]} scale={[0.8, 0.28, 1.5]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={vaseColor} roughness={0.72} /></mesh>
    <mesh position={[0, 0.39, -2.55]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.83, 0.83, 1]}><torusGeometry args={[1, 0.075, 7, 22]} /><meshStandardMaterial color="#D7E7DD" roughness={0.65} /></mesh>
    {[-.4, .3, 1, 1.7].map((z) => <mesh key={z} position={[0, .18 + .65 * Math.sqrt(1 - ((z - .9) / 2.4) ** 2) + .005, z]} scale={[.7, .013, .025]}><sphereGeometry args={[1, 24, 8]} /><meshStandardMaterial color="#DCEAD7" roughness={.3} /></mesh>)}
    <mesh position={[2.95, 0.3, -3.65]} scale={[0.12, 0.6, 0.12]}><cylinderGeometry args={[1, 1, 1, 10]} /><meshStandardMaterial color="#B69A76" roughness={0.7} /></mesh>
    <mesh position={[2.95, 0.63, -3.65]} rotation={[0, 0, Math.PI / 2]} scale={[0.12, 0.7, 0.12]}><cylinderGeometry args={[1, 1, 1, 10]} /><meshStandardMaterial color="#B69A76" roughness={0.7} /></mesh>
  </>;
}

function PaintWorld({ variation }: { variation: number }) {
  const base = ['#ECE5D9', '#EEE6CF', '#D7E3E2'][variation % 3]!;
  return <>
    <RoundedBoard width={8.1} depth={10.65} height={0.32} position={[0, -0.27, 0]} color="#BC9A75" />
    <mesh position={[0, -0.08, 0]} scale={[7.75, 0.07, 10.3]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={base} roughness={0.98} /></mesh>
    {[-1, 1].map((side) => <mesh key={side} position={[side * 3.85, 0.08, 0]} scale={[0.13, 0.24, 10.35]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#D1B38C" roughness={0.91} /></mesh>)}
    {[-5.1, 5.1].map((z) => <mesh key={z} position={[0, 0.08, z]} scale={[7.8, 0.24, 0.13]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#D1B38C" roughness={0.91} /></mesh>)}
  </>;
}

function ClayWorld({ variation }: { variation: number }) {
  const slab = ['#D2A087', '#D8BEA3', '#D1A69A'][variation % 3]!;
  return <>
    <RoundedBoard width={8.2} depth={10.7} height={0.32} position={[0, -0.26, 0]} color="#B99978" />
    <mesh position={[0, -0.03, 0]} scale={[7.6, 0.19, 10]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color={slab} roughness={0.93} /></mesh>
    <SoftBox size={[6.4, .15, 8.96]} position={[0, .1, 0]} color={slab} radius={.07} roughness={.85} />
  </>;
}

export function SurfaceEnvironment({ game, variation, reducedMotion, complete }: { game: GameId; variation: number; reducedMotion: boolean; complete: boolean }) {
  return <>
    <StudioLight />
    {game === 'window' && <Arrival reducedMotion={reducedMotion}><WindowSurround reducedMotion={reducedMotion} /></Arrival>}
    {game === 'reveal' && <Arrival reducedMotion={reducedMotion}><IllustrationDesk reducedMotion={reducedMotion} /></Arrival>}
    {game === 'wash' && <Arrival reducedMotion={reducedMotion}><WashStudio reducedMotion={reducedMotion} /></Arrival>}
    {game === 'clay' && <Arrival reducedMotion={reducedMotion}><ClayStudio reducedMotion={reducedMotion} /></Arrival>}
    {game === 'paint' && <Arrival reducedMotion={reducedMotion}><PaintAtelier reducedMotion={reducedMotion} /></Arrival>}
    {game === 'window' ? <WindowWorld variation={variation} /> : game === 'reveal' ? <RevealedRelief variation={variation} complete={complete} reducedMotion={reducedMotion} /> : game === 'wash' ? <WashWorld variation={variation} /> : game === 'paint' ? <PaintWorld variation={variation} /> : <ClayWorld variation={variation} />}
  </>;
}
