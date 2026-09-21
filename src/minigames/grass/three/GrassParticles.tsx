import { useFrame } from '@react-three/fiber/native';
import { useLayoutEffect, useRef } from 'react';
import { Color, InstancedMesh, Object3D } from 'three';
import { LawnController } from './LawnController';
import { SURFACE_Y } from './sceneModel';

const dummy = new Object3D();
const color = new Color();

export function GrassParticles({
  controller,
  reducedMotion,
}: {
  controller: LawnController;
  reducedMotion: boolean;
}) {
  const mesh = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!mesh.current) return;
    controller.particles.forEach((particle, index) => {
      dummy.position.set(0, -5, 0);
      dummy.scale.setScalar(0.001);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(index, dummy.matrix);
      mesh.current!.setColorAt(
        index,
        color.set(index % 3 === 0 ? '#C6D77B' : index % 3 === 1 ? '#77A968' : '#E7D488'),
      );
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.instanceColor!.needsUpdate = true;
  }, [controller]);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    let dirty = false;
    controller.particles.forEach((particle, index) => {
      if (particle.age >= particle.life) return;
      particle.age += Math.min(delta, 0.05) * (reducedMotion ? 2.6 : 1);
      const t = Math.min(1, particle.age / particle.life);
      const angle = (particle.phase * 2.399963) % (Math.PI * 2);
      const distance = Math.sin(t * Math.PI * 0.85) * 0.13;
      dummy.position.set(
        particle.x + Math.cos(angle) * distance,
        SURFACE_Y + 0.25 + Math.sin(t * Math.PI) * 0.31 - t * 0.12,
        particle.z + Math.sin(angle) * distance,
      );
      dummy.rotation.set(t * 4, angle, t * 5);
      const size = (1 - t) * (reducedMotion ? 0.45 : 1);
      dummy.scale.set(0.045 * size, 0.015 * size, 0.08 * size);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(index, dummy.matrix);
      dirty = true;
    });
    if (dirty) mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, controller.particles.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 5, 4]} />
      <meshStandardMaterial roughness={0.88} metalness={0} />
    </instancedMesh>
  );
}
