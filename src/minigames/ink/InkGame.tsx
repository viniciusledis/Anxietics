import { memo, useEffect, useMemo } from 'react';
import { Circle, Group, Rect } from '@shopify/react-native-skia';
import {
  SharedValue,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';
import { Point } from '../grass/coverage';
import { GameProps } from '../types';
import { GAME_INFO } from '../definitions';
import { Field } from '../shared/Field';
import { useFieldGesture } from '../shared/useFieldGesture';
import { useFeedback } from '../shared/useFeedback';
import {
  INK_INTERACTIONS,
  INK_LIMIT,
  InkState,
  addInk,
  countInk,
  createInk,
  expandInk,
} from './rules';
function Drop({
  index,
  state,
}: {
  index: number;
  state: SharedValue<InkState>;
}) {
  const x = useDerivedValue(() => state.value.drops[index]?.x ?? 0);
  const y = useDerivedValue(() => state.value.drops[index]?.y ?? 0);
  const radius = useDerivedValue(() => state.value.drops[index]?.radius ?? 0);
  const inner = useDerivedValue(() => radius.value * 0.72);
  const color = useDerivedValue(
    () => GAME_INFO.ink.colors![state.value.drops[index]?.color ?? 0]!,
  );
  return (
    <Group blendMode="multiply">
      <Circle cx={x} cy={y} r={radius} color={color} opacity={0.19} />
      <Circle cx={x} cy={y} r={inner} color={color} opacity={0.14} />
    </Group>
  );
}
export const InkGame = memo(function InkGame(props: GameProps) {
  const initial = useMemo(createInk, []);
  const state = useSharedValue(initial);
  const lastStamp = useSharedValue<Point>({ x: 0, y: 0 });
  const expanding = useSharedValue(false);
  const { report, finished } = useFeedback(props);
  const frame = useFrameCallback(({ timeSincePreviousFrame }) => {
    'worklet';
    if (!expanding.value || finished.value) return;
    state.modify((s) => {
      'worklet';
      expandInk(s, Math.min(timeSincePreviousFrame ?? 0, 50) / 1000);
      expanding.value = s.drops.some((drop) => drop.radius < drop.target);
      return s;
    });
  }, false);
  useEffect(() => {
    frame.setActive(props.enabled && !props.reducedMotion);
    if (props.reducedMotion)
      state.modify((s) => {
        'worklet';
        for (const drop of s.drops) drop.radius = drop.target;
        return s;
      });
    return () => frame.setActive(false);
  }, [props.enabled, props.reducedMotion, frame, state]);
  const gesture = useFieldGesture(
    props.scale,
    props.enabled,
    (p) => {
      'worklet';
      if (finished.value) return;
      lastStamp.value = p;
      state.modify((s) => {
        'worklet';
        addInk(s, p, props.color, props.reducedMotion);
        countInk(s, props.color);
        if (props.mode !== 'free')
          report(
            (s.counts.reduce((a, b) => a + b, 0) / (INK_INTERACTIONS * 3)) *
              100,
          );
        return s;
      });
      expanding.value = true;
    },
    (_previous, b) => {
      'worklet';
      if (finished.value) return;
      const a = lastStamp.value;
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      if (length < 10) return;
      const steps = Math.ceil(length / 18);
      lastStamp.value = b;
      state.modify((s) => {
        'worklet';
        for (let i = 1; i <= steps; i++)
          addInk(
            s,
            {
              x: a.x + ((b.x - a.x) * i) / steps,
              y: a.y + ((b.y - a.y) * i) / steps,
            },
            props.color,
            props.reducedMotion,
          );
        return s;
      });
      expanding.value = true;
    },
    () => {
      'worklet';
    },
  );
  return (
    <Field
      scale={props.scale}
      gesture={gesture}
      label="Água para espalhar tinta. As três cores ficam acima do campo"
    >
      <Rect
        x={0}
        y={0}
        width={320}
        height={448}
        color={['#E4EADE', '#DCE6EB', '#EAE5DE'][props.variation % 3]}
      />
      {Array.from({ length: INK_LIMIT }, (_, index) => (
        <Drop key={index} index={index} state={state} />
      ))}
    </Field>
  );
});
