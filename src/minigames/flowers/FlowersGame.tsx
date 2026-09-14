import { memo, useMemo } from 'react';
import {
  Circle,
  DashPathEffect,
  Path,
  Rect,
  Skia,
} from '@shopify/react-native-skia';
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
import {
  FLOWERS_PER_REGION,
  FlowerState,
  REGIONS,
  createFlowers,
  flowerPoint,
  plantSegment,
} from './rules';
function Region({
  index,
  state,
}: {
  index: number;
  state: SharedValue<FlowerState>;
}) {
  const done = useDerivedValue(() =>
    state.value.regions[index]! >= FLOWERS_PER_REGION ? '#496B43' : '#A8B899',
  );
  return (
    <Circle
      cx={REGIONS[index]!.x}
      cy={REGIONS[index]!.y}
      r={60}
      style="stroke"
      strokeWidth={2}
      color={done}
    >
      <DashPathEffect intervals={[5, 7]} />
    </Circle>
  );
}
export const FlowersGame = memo(function FlowersGame(props: GameProps) {
  const initial = useMemo(createFlowers, []);
  const state = useSharedValue(initial);
  const petals = useSharedValue(Skia.Path.Make());
  const centers = useSharedValue(Skia.Path.Make());
  const stems = useSharedValue(Skia.Path.Make());
  const { report, finished } = useFeedback(props);
  const plant = (a: Point, b: Point) => {
    'worklet';
    if (finished.value) return;
    state.modify((current) => {
      'worklet';
      const changed = plantSegment(current, a, b);
      if (changed.length) {
        petals.modify((path) => {
          'worklet';
          for (const index of changed) {
            const p = flowerPoint(index);
            for (let i = 0; i < 5; i++)
              path.addCircle(
                p.x + Math.cos((i * Math.PI * 2) / 5) * 4.7,
                p.y + Math.sin((i * Math.PI * 2) / 5) * 4.7,
                4,
              );
          }
          return path;
        });
        centers.modify((path) => {
          'worklet';
          for (const index of changed) {
            const p = flowerPoint(index);
            path.addCircle(p.x, p.y, 2.9);
          }
          return path;
        });
        stems.modify((path) => {
          'worklet';
          for (const index of changed) {
            const p = flowerPoint(index);
            path.moveTo(p.x, p.y).lineTo(p.x, p.y + 10);
          }
          return path;
        });
      }
      if (props.mode !== 'free')
        report(
          (current.regions.reduce((a, b) => a + b, 0) /
            (FLOWERS_PER_REGION * 4)) *
            100,
        );
      return current;
    });
  };
  const gesture = useFieldGesture(
    props.scale,
    props.enabled,
    (p) => {
      'worklet';
      plant(p, p);
    },
    plant,
    () => {
      'worklet';
    },
  );
  return (
    <Field
      scale={props.scale}
      gesture={gesture}
      label="Terreno para plantar flores. Quatro círculos indicam as regiões da tarefa"
    >
      <Rect x={0} y={0} width={320} height={448} color="#DDE7CC" />
      {props.mode !== 'free' &&
        REGIONS.map((_, index) => (
          <Region key={index} index={index} state={state} />
        ))}
      <Path path={stems} style="stroke" strokeWidth={2} color="#678C60" />
      <Path
        path={petals}
        color={['#C3849D', '#F1EAD5', '#9D8FBD'][props.variation % 3]}
      />
      <Path path={centers} color="#C5A44F" />
    </Field>
  );
});
