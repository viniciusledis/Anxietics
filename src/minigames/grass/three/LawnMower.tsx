import { useFrame } from '@react-three/fiber/native';
import { useMemo, useRef } from 'react';
import { Group, MathUtils } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { LawnController } from './LawnController';
import { SURFACE_Y } from './sceneModel';

function SoftBox({
  size,
  color,
  position,
  scale,
  roughness = 0.78,
}: {
  size: [number, number, number];
  color: string;
  position: [number, number, number];
  scale?: [number, number, number];
  roughness?: number;
}) {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(...size, 3, Math.min(...size) * 0.42),
    [size[0], size[1], size[2]],
  );
  return (
    <mesh geometry={geometry} position={position} scale={scale}>
      <meshStandardMaterial color={color} roughness={roughness} metalness={0.02} />
    </mesh>
  );
}

function Wheel({ x, z, wheelRef }: { x: number; z: number; wheelRef: (wheel: Group | null) => void }) {
  return (
    <group ref={wheelRef} position={[x, 0.22, z]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 12]} />
        <meshStandardMaterial color="#304039" roughness={0.98} />
      </mesh>
      <mesh position={[x > 0 ? 0.072 : -0.072, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.092, 0.092, 0.015, 12]} />
        <meshStandardMaterial color="#E4B65E" roughness={0.7} />
      </mesh>
      <mesh position={[x > 0 ? 0.084 : -0.084, 0.058, 0]}>
        <sphereGeometry args={[0.022, 6, 5]} />
        <meshStandardMaterial color="#FFF1C9" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function LawnMower({
  controller,
  color,
  width,
  reducedMotion,
}: {
  controller: LawnController;
  color: string;
  width: number;
  reducedMotion: boolean;
}) {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const wheels = useRef<(Group | null)[]>([]);
  const heading = useRef(0);
  const spin = useRef(0);
  const sway = useRef(0);

  useFrame((state, delta) => {
    const machine = root.current;
    if (!machine) return;
    const dt = Math.min(delta, 0.05);
    const smoothing = 1 - Math.exp(-dt * 21);
    const oldX = machine.position.x;
    const oldZ = machine.position.z;
    machine.position.x = MathUtils.lerp(oldX, controller.mower.x, smoothing);
    machine.position.z = MathUtils.lerp(oldZ, controller.mower.z, smoothing);
    const dx = machine.position.x - oldX;
    const dz = machine.position.z - oldZ;
    const distance = Math.hypot(dx, dz);
    if (controller.moving && distance > 0.0004) {
      const desired = Math.atan2(-dx, -dz);
      const shortest = Math.atan2(Math.sin(desired - heading.current), Math.cos(desired - heading.current));
      heading.current += shortest * (1 - Math.exp(-dt * 10));
    }
    machine.rotation.y = heading.current;
    spin.current += distance / 0.18;
    wheels.current.forEach((wheel) => {
      if (wheel) wheel.rotation.x = spin.current;
    });
    controller.cutPulse = Math.max(0, controller.cutPulse - dt * 2.2);
    if (controller.completed) controller.celebrationTime += dt;
    if (body.current) {
      sway.current = MathUtils.lerp(sway.current, Math.min(1, distance * 16), 0.14);
      const bounce = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 19) * controller.cutPulse * 0.028;
      const celebration = !reducedMotion && controller.completed
        ? Math.sin(Math.min(controller.celebrationTime, 0.8) * Math.PI / 0.8) * 0.16
        : 0;
      body.current.position.y = bounce + celebration;
      body.current.rotation.z = reducedMotion ? 0 : -dx * 0.7;
      body.current.rotation.x = reducedMotion ? 0 : -sway.current * 0.035;
    }
  });

  return (
    <group ref={root} position={[controller.mower.x, SURFACE_Y, controller.mower.z]}>
      <mesh position={[0, 0.006, 0.03]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.56 * width, 0.75, 1]}>
        <circleGeometry args={[1, 20]} />
        <meshBasicMaterial color="#25452F" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <group ref={body}>
        <SoftBox size={[0.83, 0.2, 1.07]} color="#294D3D" position={[0, 0.21, 0.03]} scale={[width, 1, 1]} />
        <SoftBox size={[0.76, 0.26, 0.76]} color={color} position={[0, 0.35, -0.13]} scale={[width, 1, 1]} roughness={0.68} />
        <SoftBox size={[0.5, 0.1, 0.42]} color="#F6DFAF" position={[0, 0.46, -0.08]} scale={[width, 1, 1]} />
        <SoftBox size={[0.3, 0.045, 0.23]} color="#365D4B" position={[0, 0.515, -0.09]} scale={[width, 1, 1]} />
        <SoftBox size={[0.74, 0.14, 0.16]} color="#E4A366" position={[0, 0.34, -0.55]} scale={[width, 1, 1]} />
        <SoftBox size={[0.48, 0.035, 0.03]} color="#FFE7BE" position={[0, 0.34, -0.642]} scale={[width, 1, 1]} />
        <mesh position={[-0.24 * width, 0.67, 0.48]} rotation={[-0.34, 0, -0.12]}>
          <cylinderGeometry args={[0.027, 0.027, 0.76, 8]} />
          <meshStandardMaterial color="#355247" roughness={0.75} />
        </mesh>
        <mesh position={[0.24 * width, 0.67, 0.48]} rotation={[-0.34, 0, 0.12]}>
          <cylinderGeometry args={[0.027, 0.027, 0.76, 8]} />
          <meshStandardMaterial color="#355247" roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.02, 0.61]} rotation={[0, 0, Math.PI / 2]} scale={[width, 1, 1]}>
          <cylinderGeometry args={[0.045, 0.045, 0.6, 8]} />
          <meshStandardMaterial color="#E4A366" roughness={0.8} />
        </mesh>
        <Wheel x={-0.4 * width} z={-0.34} wheelRef={(wheel) => { wheels.current[0] = wheel; }} />
        <Wheel x={0.4 * width} z={-0.34} wheelRef={(wheel) => { wheels.current[1] = wheel; }} />
        <Wheel x={-0.4 * width} z={0.39} wheelRef={(wheel) => { wheels.current[2] = wheel; }} />
        <Wheel x={0.4 * width} z={0.39} wheelRef={(wheel) => { wheels.current[3] = wheel; }} />
      </group>
    </group>
  );
}
