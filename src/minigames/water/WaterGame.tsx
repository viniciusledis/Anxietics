import { memo, useEffect } from 'react';
import {
  Circle,
  Group,
  Line,
  Path,
  Rect,
  RoundedRect,
  vec,
} from '@shopify/react-native-skia';
import {
  SharedValue,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { GameProps } from '../types';
import { Point } from '../grass/coverage';
import { Field } from '../shared/Field';
import { useFieldGesture } from '../shared/useFieldGesture';
import { useFeedback } from '../shared/useFeedback';
import { POTS, waterAt } from './rules';

function Plant({
  index,
  levels,
  color,
}: {
  index: number;
  levels: SharedValue<number[]>;
  color: string;
}) {
  const p = POTS[index]!;
  const height = useDerivedValue(() => 18 + levels.value[index]! * 57);
  const top = useDerivedValue(() => p.y - height.value);
  const bloom = useDerivedValue(() =>
    levels.value[index]! >= 1 ? 1 : levels.value[index]! * 0.55,
  );
  const transform = useDerivedValue(() => [
    { translateX: p.x },
    { translateY: top.value },
  ]);
  const fill = useDerivedValue(() => levels.value[index]! * 62);
  return (
    <>
      <RoundedRect
        x={p.x - 3}
        y={top}
        width={6}
        height={height}
        r={3}
        color="#608163"
      />
      <Group transform={transform}>
        <Group opacity={bloom}>
          {[-12, 12].map((dx) => (
            <Circle key={dx} cx={dx} cy={0} r={12} color={color} />
          ))}
          <Circle cx={0} cy={-12} r={12} color={color} />
          <Circle cx={0} cy={12} r={12} color={color} />
          <Circle cx={0} cy={0} r={8} color="#E9CD79" />
        </Group>
      </Group>
      <Path
        path={`M${p.x} ${p.y - 18} Q${p.x - 38} ${p.y - 49} ${p.x - 30} ${p.y - 16}Z`}
        color="#82A578"
      />
      <Path
        path={`M${p.x - 33} ${p.y} L${p.x + 33} ${p.y} L${p.x + 24} ${p.y + 47} L${p.x - 24} ${p.y + 47}Z`}
        color="#B78668"
      />
      <RoundedRect
        x={p.x - 38}
        y={p.y - 5}
        width={76}
        height={13}
        r={6}
        color="#CE9E7D"
      />
      <RoundedRect
        x={p.x - 31}
        y={p.y + 59}
        width={62}
        height={5}
        r={2}
        color="#D2DACA"
      />
      <RoundedRect
        x={p.x - 31}
        y={p.y + 59}
        width={fill}
        height={5}
        r={2}
        color="#739D81"
      />
    </>
  );
}
export const WaterGame = memo(function WaterGame(props: GameProps) {
  const pointer = useSharedValue<Point>({ x: 160, y: 390 });
  const holding = useSharedValue(false);
  const levels = useSharedValue([0, 0, 0, 0]);
  const { report, finished } = useFeedback(props);
  const transform = useDerivedValue(() => [
    { translateX: pointer.value.x },
    { translateY: pointer.value.y },
  ]);
  const waterOpacity = useDerivedValue(() => (holding.value ? 0.75 : 0));
  // Acumula tempo só enquanto o dedo segura o regador. Retornar do background não dá água extra.
  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    'worklet';
    if (!holding.value || finished.value) return;
    levels.modify((current) => {
      'worklet';
      waterAt(
        current,
        pointer.value,
        Math.min(timeSincePreviousFrame ?? 0, 50) / 1000,
      );
      return current;
    });
    report(
      (levels.value.reduce((sum, value) => sum + value, 0) / POTS.length) * 100,
    );
  }, false);
  useEffect(() => {
    frame.setActive(props.enabled);
    if (!props.enabled) holding.value = false;
    return () => frame.setActive(false);
  }, [props.enabled, frame, holding]);
  const gesture = useFieldGesture(
    props.scale,
    props.enabled,
    (p) => {
      'worklet';
      if ((p.x - pointer.value.x) ** 2 + (p.y - pointer.value.y) ** 2 < 58 ** 2)
        holding.value = true;
    },
    (_a, p) => {
      'worklet';
      if (holding.value) pointer.value = p;
    },
    () => {
      'worklet';
      holding.value = false;
    },
  );
  return (
    <Field
      scale={props.scale}
      gesture={gesture}
      label="Arraste o regador na parte de baixo até cada vaso e segure"
    >
      <Rect x={0} y={0} width={320} height={448} color="#E6EDDD" />
      {[212, 377].map((y) => (
        <Line
          key={y}
          p1={vec(20, y)}
          p2={vec(300, y)}
          color="#C4D0B9"
          strokeWidth={5}
        />
      ))}
      {POTS.map((_, index) => (
        <Plant
          key={index}
          index={index}
          levels={levels}
          color={['#CC8D9C', '#D8B760', '#A28EBE'][props.variation % 3]!}
        />
      ))}
      <Group transform={transform}>
        <Group opacity={waterOpacity}>
          {[-12, 0, 12].map((dx) => (
            <Circle key={dx} cx={dx} cy={14} r={3} color="#7FBEC5" />
          ))}
        </Group>
        <Path path="M0 0 L20 -27 L34 -18 L4 9Z" color="#76A6AA" />
        <RoundedRect
          x={22}
          y={-41}
          width={43}
          height={39}
          r={12}
          color="#629397"
        />
        <Circle
          cx={63}
          cy={-24}
          r={13}
          style="stroke"
          strokeWidth={6}
          color="#629397"
        />
        <Circle cx={0} cy={0} r={9} color="#B7D6D5" />
      </Group>
    </Field>
  );
});
