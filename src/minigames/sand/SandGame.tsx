import { memo } from 'react';
import {
  Circle,
  Group,
  Path,
  Rect,
  RoundedRect,
  Skia,
} from '@shopify/react-native-skia';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { GameProps } from '../types';
import { Point } from '../grass/coverage';
import { Field } from '../shared/Field';
import { useFieldGesture } from '../shared/useFieldGesture';
import { useFeedback } from '../shared/useFeedback';
import { SAND_PATHS, endSand, moveSand, startSand } from './rules';

const HISTORY = 12;
const SEGMENTS_PER_PATH = 100;
export const SandGame = memo(function SandGame(props: GameProps) {
  const paths = useSharedValue(
    Array.from({ length: HISTORY }, () => Skia.Path.Make()),
  );
  const combined = useDerivedValue(() => {
    const result = Skia.Path.Make();
    for (const path of paths.value) result.addPath(path);
    return result;
  });
  const slot = useSharedValue(-1);
  const segments = useSharedValue(0);
  const pointer = useSharedValue<Point>({ x: 160, y: 350 });
  const state = useSharedValue({ start: { x: 0, y: 0 }, extent: 0, count: 0 });
  const transform = useDerivedValue(() => [
    { translateX: pointer.value.x },
    { translateY: pointer.value.y },
  ]);
  const { report, finished } = useFeedback(props);
  const nextPath = () => {
    'worklet';
    slot.value = (slot.value + 1) % HISTORY;
    segments.value = 0;
    paths.modify((all) => {
      'worklet';
      all[slot.value]!.reset();
      return all;
    });
  };
  const gesture = useFieldGesture(
    props.scale,
    props.enabled,
    (p) => {
      'worklet';
      if (finished.value) return;
      nextPath();
      pointer.value = p;
      state.modify((s) => {
        'worklet';
        startSand(s, p);
        return s;
      });
    },
    (a, b) => {
      'worklet';
      if (finished.value || Math.hypot(b.x - a.x, b.y - a.y) === 0) return;
      pointer.value = b;
      state.modify((s) => {
        'worklet';
        moveSand(s, b);
        return s;
      });
      if (segments.value >= SEGMENTS_PER_PATH) nextPath();
      const length = Math.hypot(b.x - a.x, b.y - a.y);
      const nx = -(b.y - a.y) / length;
      const ny = (b.x - a.x) / length;
      paths.modify((all) => {
        'worklet';
        const path = all[slot.value]!;
        for (let offset = -12; offset <= 12; offset += 6)
          path
            .moveTo(a.x + nx * offset, a.y + ny * offset)
            .lineTo(b.x + nx * offset, b.y + ny * offset);
        return all;
      });
      segments.value++;
    },
    (_p, success) => {
      'worklet';
      state.modify((s) => {
        'worklet';
        endSand(s, success);
        return s;
      });
      if (props.mode !== 'free') report((state.value.count / SAND_PATHS) * 100);
    },
  );
  return (
    <Field
      scale={props.scale}
      gesture={gesture}
      label="Rastelo com cinco dentes. Trace caminhos amplos e solte o dedo entre eles"
    >
      <Rect
        x={0}
        y={0}
        width={320}
        height={448}
        color={['#DCC8A4', '#DFC1AB', '#D8C08B'][props.variation % 3]}
      />
      {Array.from({ length: 100 }, (_, i) => (
        <Circle
          key={i}
          cx={(i * 83) % 320}
          cy={(i * 73) % 448}
          r={0.8}
          color="#A89068"
        />
      ))}
      <Path
        path={combined}
        color="#AD916A"
        style="stroke"
        strokeWidth={3}
        strokeCap="round"
      />
      <Group transform={[{ translateY: 2 }]}>
        <Path
          path={combined}
          color="#F1DCB9"
          style="stroke"
          strokeWidth={1.3}
          strokeCap="round"
        />
      </Group>
      <Group transform={transform}>
        <RoundedRect
          x={-3}
          y={-6}
          width={6}
          height={47}
          r={3}
          color="#85654A"
        />
        <RoundedRect
          x={-22}
          y={-10}
          width={44}
          height={7}
          r={3}
          color="#94704D"
        />
        {[-18, -9, 0, 9, 18].map((x) => (
          <RoundedRect
            key={x}
            x={x - 2}
            y={-17}
            width={4}
            height={20}
            r={2}
            color="#795B3F"
          />
        ))}
      </Group>
    </Field>
  );
});
