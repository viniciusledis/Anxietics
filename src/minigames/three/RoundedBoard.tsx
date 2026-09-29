import { useEffect, useMemo } from 'react';
import { ExtrudeGeometry, Shape } from 'three';

export function RoundedBoard({ width, depth, height, radius = 0.28, color, position, roughness = 0.94 }: {
  width: number; depth: number; height: number; radius?: number; color: string;
  position: [number, number, number]; roughness?: number;
}) {
  const geometry = useMemo(() => {
    const x = width / 2;
    const z = depth / 2;
    const r = Math.min(radius, x, z);
    const bevel = Math.min(0.045, height / 4);
    const outline = new Shape();
    outline.moveTo(-x + r, -z);
    outline.lineTo(x - r, -z);
    outline.quadraticCurveTo(x, -z, x, -z + r);
    outline.lineTo(x, z - r);
    outline.quadraticCurveTo(x, z, x - r, z);
    outline.lineTo(-x + r, z);
    outline.quadraticCurveTo(-x, z, -x, z - r);
    outline.lineTo(-x, -z + r);
    outline.quadraticCurveTo(-x, -z, -x + r, -z);
    const value = new ExtrudeGeometry(outline, {
      depth: height - bevel * 2,
      steps: 1,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 2,
      curveSegments: 4,
    });
    value.rotateX(-Math.PI / 2);
    value.translate(0, -height / 2 + bevel, 0);
    value.computeVertexNormals();
    return value;
  }, [width, depth, height, radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={roughness} metalness={0} />
  </mesh>;
}
