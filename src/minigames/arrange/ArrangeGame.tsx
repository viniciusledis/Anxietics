import { memo, useEffect, useMemo } from 'react';
import {
  Circle,
  Group,
  Path,
  Rect,
  RoundedRect,
} from '@shopify/react-native-skia';
import {
  cancelAnimation,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { GameProps } from '../types';
import { Point } from '../grass/coverage';
import { Field } from '../shared/Field';
import { useFeedback } from '../shared/useFeedback';
import { useFieldGesture } from '../shared/useFieldGesture';
import { BALL_TARGETS, Piece, fits, hitPiece, makePieces } from './rules';

const PALETTES = [
  ['#C68C93', '#81A494', '#B2A05F'],
  ['#8299B8', '#AA8AAB', '#86A584'],
  ['#BA8669', '#889A68', '#A198B7'],
];
function SymbolMark({ group }: { group: number }) {
  return group === 0 ? (
    <Circle
      cx={0}
      cy={0}
      r={8}
      style="stroke"
      strokeWidth={3}
      color="#354C47"
    />
  ) : group === 1 ? (
    <Path
      path="M0 -10 L10 0 L0 10 L-10 0Z"
      style="stroke"
      strokeWidth={3}
      color="#354C47"
    />
  ) : (
    <Path
      path="M-8 -6 L8 -6 M-8 1 L8 1 M-8 8 L8 8"
      style="stroke"
      strokeWidth={3}
      color="#354C47"
    />
  );
}
function Stone({
  group,
  color,
  outline = false,
}: {
  group: number;
  color: string;
  outline?: boolean;
}) {
  const style = outline ? ('stroke' as const) : ('fill' as const);
  return group === 0 ? (
    <Circle cx={0} cy={0} r={25} color={color} style={style} strokeWidth={3} />
  ) : group === 1 ? (
    <RoundedRect
      x={-30}
      y={-19}
      width={60}
      height={38}
      r={19}
      color={color}
      style={style}
      strokeWidth={3}
    />
  ) : group === 2 ? (
    <Path
      path="M0 -28 Q5 -28 30 -3 Q34 0 29 6 L4 28 Q0 32 -7 25 L-28 5 Q-32 0 -26 -8Z"
      color={color}
      style={style}
      strokeWidth={3}
    />
  ) : (
    <RoundedRect
      x={-24}
      y={-24}
      width={48}
      height={48}
      r={10}
      color={color}
      style={style}
      strokeWidth={3}
    />
  );
}
function MovingPiece({
  piece,
  index,
  active,
  pointer,
  placed,
  balls,
  palette,
  reducedMotion,
  enabled,
}: {
  piece: Piece;
  index: number;
  active: SharedValue<number>;
  pointer: SharedValue<Point>;
  placed: SharedValue<number[]>;
  balls: boolean;
  palette: string[];
  reducedMotion: boolean;
  enabled: boolean;
}) {
  const x = useDerivedValue(() => {
    if (active.value === index) return pointer.value.x;
    const target = placed.value[index] ? piece.target.x : piece.home.x;
    return reducedMotion || !enabled
      ? target
      : withTiming(target, { duration: 220 });
  });
  const y = useDerivedValue(() => {
    if (active.value === index) return pointer.value.y;
    const target = placed.value[index] ? piece.target.y : piece.home.y;
    return reducedMotion || !enabled
      ? target
      : withTiming(target, { duration: 220 });
  });
  const transform = useDerivedValue(() => [
    { translateX: x.value },
    { translateY: y.value },
  ]);
  const opacity = useDerivedValue(() =>
    balls && placed.value[index] ? 0.25 : 1,
  );
  useEffect(
    () => () => {
      cancelAnimation(x);
      cancelAnimation(y);
    },
    [x, y],
  );
  return (
    <Group transform={transform} opacity={opacity}>
      {balls ? (
        <>
          <Circle cx={0} cy={0} r={25} color={palette[piece.group]} />
          <Circle cx={-7} cy={-9} r={7} color="#FFFFFF" opacity={0.25} />
          <SymbolMark group={piece.group} />
        </>
      ) : (
        <>
          <Stone
            group={piece.group}
            color={
              ['#8D9692', '#A39681', '#8F9C9F', '#9D929B'][
                (piece.group + PALETTES.indexOf(palette)) % 4
              ] ?? '#919A93'
            }
          />
          <Path
            path="M-9 -8 Q0 -15 10 -7"
            style="stroke"
            strokeWidth={3}
            color="#D3D7CB"
          />
        </>
      )}
    </Group>
  );
}
export const ArrangeGame = memo(function ArrangeGame(props: GameProps) {
  const balls = props.game === 'balls';
  const pieces = useMemo(() => makePieces(balls), [balls]);
  const placed = useSharedValue(pieces.map(() => 0));
  const active = useSharedValue(-1);
  const pointer = useSharedValue<Point>({ x: 0, y: 0 });
  const { report, finished } = useFeedback(props);
  const palette = PALETTES[props.variation % 3]!;
  useEffect(() => {
    if (!props.enabled) active.value = -1;
  }, [props.enabled, active]);
  const end = (p: Point, success: boolean) => {
    'worklet';
    const index = active.value;
    if (index >= 0 && success && fits(pieces[index]!, p)) {
      placed.modify((current) => {
        'worklet';
        current[index] = 1;
        return current;
      });
      report(
        (placed.value.reduce((sum, value) => sum + value, 0) / pieces.length) *
          100,
      );
    }
    active.value = -1;
  };
  const gesture = useFieldGesture(
    props.scale,
    props.enabled,
    (p) => {
      'worklet';
      if (finished.value) return;
      active.value = hitPiece(pieces, placed.value, p);
      if (active.value >= 0) pointer.value = pieces[active.value]!.home;
    },
    (_a, p) => {
      'worklet';
      if (active.value >= 0) pointer.value = p;
    },
    end,
  );
  return (
    <Field
      scale={props.scale}
      gesture={gesture}
      label={
        balls
          ? 'Bolinhas e recipientes com símbolos correspondentes'
          : 'Quatro pedras e seus contornos'
      }
    >
      <Rect
        x={0}
        y={0}
        width={320}
        height={448}
        color={
          balls
            ? '#F0E8D5'
            : ['#E3DFCD', '#E6DACB', '#D7E0DA'][props.variation % 3]
        }
      />
      <RoundedRect
        x={15}
        y={250}
        width={290}
        height={172}
        r={25}
        color={balls ? '#E6DDC7' : '#D5CFBD'}
      />
      {balls
        ? BALL_TARGETS.map((p, i) => (
            <Group
              key={i}
              transform={[{ translateX: p.x }, { translateY: p.y }]}
            >
              <RoundedRect
                x={-43}
                y={-60}
                width={86}
                height={124}
                r={19}
                color={palette[i]}
                opacity={0.3}
              />
              <RoundedRect
                x={-43}
                y={-60}
                width={86}
                height={124}
                r={19}
                color={palette[i]}
                style="stroke"
                strokeWidth={4}
              />
              <SymbolMark group={i} />
            </Group>
          ))
        : pieces.map((piece, i) => (
            <Group
              key={i}
              transform={[
                { translateX: piece.target.x },
                { translateY: piece.target.y },
              ]}
            >
              <Stone group={piece.group} color="#8E9B8B" outline />
            </Group>
          ))}
      {pieces.map((piece, index) => (
        <MovingPiece
          key={index}
          {...{ piece, index, active, pointer, placed, balls, palette }}
          reducedMotion={props.reducedMotion}
          enabled={props.enabled}
        />
      ))}
    </Field>
  );
});
