import { ReactNode, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Camera, Vector3 } from 'three';
import { Point } from '../grass/coverage';
import { logicalPoint } from './projection';

export { logicalPoint, worldPoint } from './projection';

export type SceneController = { camera: Camera | null };

export function SceneFrame({
  controller,
  enabled,
  background,
  cameraPosition,
  cameraTarget = [0, 0, 1],
  fov = 46,
  label,
  onPoint,
  onRelease,
  onEnd,
  children,
}: {
  controller: SceneController;
  enabled: boolean;
  background: string;
  cameraPosition: [number, number, number];
  cameraTarget?: [number, number, number];
  fov?: number;
  label: string;
  onPoint: (point: Point, start: boolean) => void;
  onRelease?: (point: Point | null, success: boolean) => void;
  onEnd?: () => void;
  children: ReactNode;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const target = useMemo(() => new Vector3(...cameraTarget), [cameraTarget[0], cameraTarget[1], cameraTarget[2]]);
  const sendPoint = (x: number, y: number, start: boolean) => {
    if (!enabled) return;
    const point = logicalPoint(x, y, size.width, size.height, controller.camera);
    if (point) onPoint(point, start);
  };
  const gesture = Gesture.Pan()
    .enabled(enabled)
    .runOnJS(true)
    .minDistance(0)
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    .onBegin((event) => sendPoint(event.x, event.y, true))
    .onUpdate((event) => { if (event.numberOfPointers === 1) sendPoint(event.x, event.y, false); })
    .onEnd((event, success) => {
      if (success) sendPoint(event.x, event.y, false);
      onRelease?.(logicalPoint(event.x, event.y, size.width, size.height, controller.camera), success);
    })
    .onFinalize(() => onEnd?.());
  const layout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((old) => old.width === width && old.height === height ? old : { width, height });
  };
  return (
    <View style={styles.root} onLayout={layout}>
      <Canvas
        shadows="basic"
        style={styles.canvas}
        pointerEvents="none"
        frameloop={enabled ? 'always' : 'never'}
        camera={{ position: cameraPosition, fov, near: 0.1, far: 65 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => { camera.lookAt(target); camera.updateMatrixWorld(); controller.camera = camera; }}
      >
        <color attach="background" args={[background]} />
        {[0, 1, 2, 3].map(i => <mesh key={i} position={[.12, -.88 - i * .003, .28]} rotation={[-Math.PI / 2, 0, 0]} scale={[4.4 + i * .12, 5.85 + i * .12, 1]}>
          <circleGeometry args={[1, 64]} /><meshBasicMaterial color="#80795E" transparent opacity={.035} depthWrite={false} />
        </mesh>)}
        {children}
      </Canvas>
      <GestureDetector gesture={gesture}>
        <View collapsable={false} accessible accessibilityRole="image" accessibilityLabel={label} style={StyleSheet.absoluteFill} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({ root: { width: '100%', height: '100%', overflow: 'hidden' }, canvas: { flex: 1 } });
