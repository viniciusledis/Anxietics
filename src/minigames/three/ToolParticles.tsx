import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import { InstancedMesh, Object3D } from 'three';
import { Point } from '../grass/coverage';
import { worldPoint } from './projection';

/** Fixed visual pool; never reports progress or owns interaction state. */
export function ToolParticles({ point, active, reducedMotion, color, kind = 'dust', height = .55 }: {
  point: Point; active: boolean; reducedMotion: boolean; color: string; kind?: 'dust' | 'bubble' | 'drop'; height?: number;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const pool = useMemo(() => Array.from({ length: 36 }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, size: 0 })), []);
  const next = useRef(0); const time = useRef(0);
  useFrame((_, delta) => {
    if (!mesh.current) return;
    const dt = Math.min(delta, .05); time.current += dt;
    if (active && !reducedMotion && time.current > .035) {
      time.current = 0;
      const [x, , z] = worldPoint(point);
      for (let n = 0; n < 2; n++) {
        const index = next.current++; const p = pool[index % pool.length]!; const a = index * 2.399;
        p.x = x + Math.sin(a) * .24; p.y = height; p.z = z + Math.cos(a) * .2;
        p.vx = Math.sin(a) * .55; p.vz = Math.cos(a) * .55;
        p.vy = kind === 'drop' ? -.5 : .6 + index % 3 * .2;
        p.life = 1; p.size = kind === 'bubble' ? .07 + index % 4 * .024 : .025 + index % 3 * .012;
      }
    }
    pool.forEach((p, i) => {
      p.life = Math.max(0, p.life - dt * (kind === 'bubble' ? .9 : 1.8));
      p.x += p.vx * dt; p.z += p.vz * dt; p.y += p.vy * dt;
      if (kind !== 'bubble') p.vy -= dt * 2.2;
      dummy.position.set(p.x, Math.max(.08, p.y), p.z);
      const size = p.size * Math.min(1, p.life * 3);
      dummy.scale.set(size, size * (kind === 'drop' ? 1.9 : 1), size);
      dummy.updateMatrix(); mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[undefined, undefined, pool.length]} frustumCulled={false}>
    <sphereGeometry args={[1, 12, 8]} />
    <meshPhysicalMaterial color={color} roughness={kind === 'bubble' ? .15 : .65} clearcoat={kind === 'bubble' ? 1 : .1} transparent={kind === 'bubble'} opacity={kind === 'bubble' ? .65 : 1} depthWrite={kind !== 'bubble'} />
  </instancedMesh>;
}
