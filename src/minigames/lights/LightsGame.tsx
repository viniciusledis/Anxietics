import { memo } from 'react';
import { Circle, Group, Line, Rect, vec } from '@shopify/react-native-skia';
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { GameProps } from '../types';
import { Point } from '../grass/coverage';
import { Field } from '../shared/Field';
import { useFieldGesture } from '../shared/useFieldGesture';
import { useFeedback } from '../shared/useFeedback';
import { CONSTELLATIONS, lightSegment } from './rules';
function Light({
  index,
  points,
  lit,
}: {
  index: number;
  points: Point[];
  lit: SharedValue<number>;
}) {
  const p = points[index]!;
  const previous = points[index - 1];
  const color = useDerivedValue(() =>
    index < lit.value ? '#E9D795' : index === lit.value ? '#C4D7DC' : '#788D9E',
  );
  const radius = useDerivedValue(() => (index === lit.value ? 14 : 7));
  const lineOpacity = useDerivedValue(() => (index < lit.value ? 1 : 0.2));
  return (
    <>
      {previous && (
        <Line
          p1={vec(previous.x, previous.y)}
          p2={vec(p.x, p.y)}
          strokeWidth={3}
          color="#DCCB93"
          opacity={lineOpacity}
        />
      )}
      <Circle
        cx={p.x}
        cy={p.y}
        r={radius}
        style="stroke"
        strokeWidth={2}
        color={color}
      />
      <Circle cx={p.x} cy={p.y} r={4} color={color} />
    </>
  );
}
export const LightsGame = memo(function LightsGame(props: GameProps) {
  const points = CONSTELLATIONS[props.variation % 3]!;
  const lit = useSharedValue(0);
  const { report } = useFeedback(props);
  const move = (a: Point, b: Point) => {
    'worklet';
    lit.value = lightSegment(points, lit.value, a, b);
    report((lit.value / points.length) * 100);
  };
  const gesture = useFieldGesture(
    props.scale,
    props.enabled,
    (p) => {
      'worklet';
      move(p, p);
    },
    move,
    () => {
      'worklet';
    },
  );
  return (
    <Field
      scale={props.scale}
      gesture={gesture}
      label="Constelação. Comece pelo círculo maior e siga a linha"
    >
      <Rect x={0} y={0} width={320} height={448} color="#2C4354" />
      {Array.from({ length: 30 }, (_, i) => (
        <Circle
          key={i}
          cx={(i * 67) % 320}
          cy={(i * 103) % 448}
          r={1.2}
          color="#94A8AE"
        />
      ))}
      <Group>
        {points.map((_, index) => (
          <Light key={index} {...{ index, points, lit }} />
        ))}
      </Group>
    </Field>
  );
});
