import { Canvas, useFrame } from '@react-three/fiber/native';
import { useRef, useState } from 'react';
import { Mesh } from 'three';

type Props = {
  active: boolean;
  onObjectTouch: (selected: boolean) => void;
};

function InteractiveObject({ onObjectTouch }: Pick<Props, 'onObjectTouch'>) {
  const mesh = useRef<Mesh>(null);
  const [selected, setSelected] = useState(false);
  const pulse = useRef(0);

  useFrame((state, delta) => {
    if (!mesh.current) return;

    mesh.current.rotation.x += delta * 0.22;
    mesh.current.rotation.y += delta * 0.55;
    mesh.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.12;

    if (pulse.current > 0) pulse.current = Math.max(0, pulse.current - delta);
    const scale = 1 + Math.sin(pulse.current * 12) * pulse.current * 0.18;
    mesh.current.scale.setScalar(scale);
  });

  return (
    <mesh
      ref={mesh}
      onPointerDown={(event) => {
        event.stopPropagation();
        const next = !selected;
        setSelected(next);
        pulse.current = 0.45;
        onObjectTouch(next);
      }}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={selected ? '#E7C66A' : '#5E9270'}
        roughness={0.55}
        metalness={0.05}
      />
    </mesh>
  );
}

export function ThreeTestScene({ active, onObjectTouch }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 4.6], fov: 42, near: 0.1, far: 20 }}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={['#E2E8D5']} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} />
      <directionalLight position={[-3, -1, 2]} intensity={0.45} color="#B9D7C1" />
      <InteractiveObject onObjectTouch={onObjectTouch} />
    </Canvas>
  );
}
