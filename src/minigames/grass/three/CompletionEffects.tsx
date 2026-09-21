import { useFrame } from '@react-three/fiber/native';
import { useLayoutEffect, useRef } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';
import { LawnController } from './LawnController';

const COUNT = 28;
const dummy = new Object3D();
const color = new Color();

export function CompletionEffects({
  controller,
  reducedMotion,
}: {
  controller: LawnController;
  reducedMotion: boolean;
}) {
  const petals = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!petals.current) return;
    for (let i = 0; i < COUNT; i++) {
      dummy.position.set(0, -5, 0);
      dummy.scale.setScalar(0.001);
      dummy.updateMatrix();
      petals.current.setMatrixAt(i, dummy.matrix);
      petals.current.setColorAt(
        i,
        color.set(i % 3 === 0 ? '#F3C877' : i % 3 === 1 ? '#E89F89' : '#FFF1CC'),
      );
    }
    petals.current.instanceMatrix.needsUpdate = true;
    petals.current.instanceColor!.needsUpdate = true;
  }, []);

  useFrame(() => {
    if (!petals.current || !controller.completed) return;
    const time = controller.celebrationTime;
    for (let i = 0; i < COUNT; i++) {
      const delay = (i % 7) * 0.04;
      const t = Math.max(0, Math.min(1, (time - delay) / 0.82));
      const angle = i * 2.399963;
      const radius = 0.5 + (i % 6) * 0.4;
      const bloom = Math.sin(t * Math.PI);
      dummy.position.set(
        Math.cos(angle) * radius * t,
        0.3 + bloom * (0.58 + (i % 4) * 0.08),
        Math.sin(angle) * radius * t,
      );
      dummy.rotation.set(t * 5, angle, t * 3);
      const size = reducedMotion ? 0 : bloom;
      dummy.scale.set(0.12 * size, 0.025 * size, 0.07 * size);
      dummy.updateMatrix();
      petals.current.setMatrixAt(i, dummy.matrix);
    }
    petals.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={petals} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 5, 4]} />
      <meshStandardMaterial roughness={0.84} metalness={0} />
    </instancedMesh>
  );
}
