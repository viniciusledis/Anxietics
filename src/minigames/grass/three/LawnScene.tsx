import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { useEffect } from 'react';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { GrassPalette } from '../../../trail/stages';
import { colors } from '../../../ui/theme';
import { CompletionEffects } from './CompletionEffects';
import { GardenEnvironment } from './GardenEnvironment';
import { GrassParticles } from './GrassParticles';
import { Lawn } from './Lawn';
import { LawnController } from './LawnController';
import { LawnMower } from './LawnMower';

const lookTarget = new Vector3();

function GameCamera({
  controller,
  reducedMotion,
}: {
  controller: LawnController;
  reducedMotion: boolean;
}) {
  const { camera, size } = useThree();
  useEffect(() => {
    controller.camera = camera;
    return () => { controller.camera = null; };
  }, [camera, controller]);
  useFrame((_, delta) => {
    const view = camera as PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const fit = Math.max(1, 0.88 / aspect);
    const followX = reducedMotion ? 0 : controller.mower.x * 0.035;
    const followZ = reducedMotion ? 0 : controller.mower.z * 0.025;
    const factor = 1 - Math.exp(-Math.min(delta, 0.05) * 2.8);
    view.position.x = MathUtils.lerp(view.position.x, 3.32 * fit + followX, factor);
    view.position.y = MathUtils.lerp(view.position.y, 11.5 * fit, factor);
    view.position.z = MathUtils.lerp(view.position.z, 7.98 * fit + followZ, factor);
    lookTarget.set(followX * 0.5, 0.15, followZ * 0.5);
    view.lookAt(lookTarget);
    view.updateMatrixWorld();
  });
  return null;
}

function GameLighting() {
  return (
    <>
      <hemisphereLight args={['#FFF7E3', '#72936C', 1.25]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 9, 7]} color="#FFF2D4" intensity={1.65} />
    </>
  );
}

export function LawnScene({
  controller,
  palette,
  mowerColor,
  mowerWidth,
  active,
  reducedMotion,
}: {
  controller: LawnController;
  palette: GrassPalette;
  mowerColor: string;
  mowerWidth: number;
  active: boolean;
  reducedMotion: boolean;
}) {
  return (
    <Canvas
      style={{ flex: 1 }}
      pointerEvents="none"
      camera={{ position: [3.32, 11.5, 7.98], fov: 35, near: 0.1, far: 60 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => { controller.camera = camera; }}
    >
      <color attach="background" args={[colors.background]} />
      <GameCamera controller={controller} reducedMotion={reducedMotion} />
      <GameLighting />
      <GardenEnvironment palette={palette} />
      <Lawn controller={controller} palette={palette} reducedMotion={reducedMotion} />
      <LawnMower controller={controller} color={mowerColor} width={mowerWidth} reducedMotion={reducedMotion} />
      <GrassParticles controller={controller} reducedMotion={reducedMotion} />
      <CompletionEffects controller={controller} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
