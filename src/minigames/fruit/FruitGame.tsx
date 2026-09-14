import { memo, useEffect } from 'react';
import { Circle, Group, Path, Rect, Skia } from '@shopify/react-native-skia';
import {
  SharedValue,
  cancelAnimation,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GameProps } from '../types';
import { Field } from '../shared/Field';
import { useFieldGesture } from '../shared/useFieldGesture';
import { useFeedback } from '../shared/useFeedback';
import { FRUITS, sliceFruit } from './rules';
function Fruit({
  index,
  sliced,
  variation,
  reducedMotion,
  enabled,
}: {
  index: number;
  sliced: SharedValue<number[]>;
  variation: number;
  reducedMotion: boolean;
  enabled: boolean;
}) {
  const p = FRUITS[index]!;
  const split = useDerivedValue(() =>
    reducedMotion || !enabled
      ? sliced.value[index]!
      : withTiming(sliced.value[index]!, { duration: 300 }),
  );
  const left = useDerivedValue(() => [{ translateX: -split.value * 12 }]);
  const right = useDerivedValue(() => [{ translateX: split.value * 12 }]);
  useEffect(() => () => cancelAnimation(split), [split]);
  const skin = ['#D7A054', '#8B9A64', '#83A57A'][variation % 3]!;
  const flesh = ['#F2D18B', '#C8CF8F', '#CB8590'][variation % 3]!;
  const body = (
    <>
      <Circle cx={0} cy={0} r={32} color={skin} />
      <Circle cx={0} cy={0} r={26} color={flesh} />
      {Array.from({ length: 6 }, (_, i) => (
        <Circle
          key={i}
          cx={Math.cos((i * Math.PI) / 3) * 16}
          cy={Math.sin((i * Math.PI) / 3) * 16}
          r={variation === 0 ? 3 : 2}
          color={variation === 0 ? '#FFF0C8' : '#72684F'}
        />
      ))}
      <Path path="M0 -29 Q12 -52 26 -34 Q9 -20 0 -29Z" color="#5F8661" />
    </>
  );
  return (
    <Group transform={[{ translateX: p.x }, { translateY: p.y }]}>
      <Group transform={left}>
        <Group clip={{ x: -50, y: -55, width: 50, height: 100 }}>{body}</Group>
      </Group>
      <Group transform={right}>
        <Group clip={{ x: 0, y: -55, width: 50, height: 100 }}>{body}</Group>
      </Group>
    </Group>
  );
}
export const FruitGame = memo(function FruitGame(props: GameProps) {
  const sliced = useSharedValue([0, 0, 0, 0, 0, 0]);
  const trail = useSharedValue(Skia.Path.Make());
  const { report, finished } = useFeedback(props);
  const gesture = useFieldGesture(
    props.scale,
    props.enabled,
    () => {
      'worklet';
    },
    (a, b) => {
      'worklet';
      if (finished.value) return;
      trail.modify((path) => {
        'worklet';
        path.reset();
        path.moveTo(a.x, a.y).lineTo(b.x, b.y);
        return path;
      });
      sliced.modify((s) => {
        'worklet';
        sliceFruit(s, a, b);
        return s;
      });
      report(
        (sliced.value.reduce((sum, value) => sum + value, 0) / FRUITS.length) *
          100,
      );
    },
    () => {
      'worklet';
      trail.modify((path) => {
        'worklet';
        path.reset();
        return path;
      });
    },
  );
  return (
    <Field
      scale={props.scale}
      gesture={gesture}
      label="Seis frutas estáticas. Passe o dedo por cada uma para cortar"
    >
      <Rect x={0} y={0} width={320} height={448} color="#EADFC8" />
      {FRUITS.map((_, index) => (
        <Fruit
          key={index}
          index={index}
          sliced={sliced}
          variation={props.variation}
          reducedMotion={props.reducedMotion}
          enabled={props.enabled}
        />
      ))}
      <Path
        path={trail}
        style="stroke"
        strokeWidth={4}
        strokeCap="round"
        color="#FFFAE5"
        opacity={0.8}
      />
    </Field>
  );
});
