import { ReactNode } from 'react';
import { View } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { GestureDetector, GestureType } from 'react-native-gesture-handler';
import { FIELD_WIDTH, FIELD_HEIGHT } from '../grass/coverage';

export function Field({
  scale,
  gesture,
  label,
  children,
}: {
  scale: number;
  gesture: GestureType;
  label: string;
  children: ReactNode;
}) {
  const size = { width: FIELD_WIDTH * scale, height: FIELD_HEIGHT * scale };
  return (
    <GestureDetector gesture={gesture}>
      <View
        collapsable={false}
        accessible
        accessibilityRole="image"
        accessibilityLabel={label}
        style={size}
      >
        <Canvas style={size}>
          <Group transform={[{ scale }]}>{children}</Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
}
