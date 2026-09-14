import { memo, useMemo } from 'react';
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
import { GAME_INFO } from '../definitions';
import { Point, createCoverage, cutSegment } from '../grass/coverage';
import { Field } from '../shared/Field';
import { useFeedback } from '../shared/useFeedback';
import { useFieldGesture } from '../shared/useFieldGesture';
import { appendCells } from '../shared/paths';
import { insideVase } from './geometry';
import { makeVase, SurfaceUnderlay } from './SurfaceArt';

export const SurfaceGame = memo(function SurfaceGame(props: GameProps) {
  const { game, variation, color, scale, enabled } = props;
  const initial = useMemo(
    () => createCoverage(game === 'wash' ? insideVase : undefined),
    [game],
  );
  const coverage = useSharedValue(initial);
  const mask = useSharedValue(Skia.Path.Make());
  const paint0 = useSharedValue(Skia.Path.Make());
  const paint1 = useSharedValue(Skia.Path.Make());
  const paint2 = useSharedValue(Skia.Path.Make());
  const x = useSharedValue(160);
  const y = useSharedValue(320);
  const touching = useSharedValue(0);
  const transform = useDerivedValue(() => [
    { translateX: x.value },
    { translateY: y.value },
  ]);
  const { report, finished } = useFeedback(props);
  const vase = useMemo(makeVase, []);
  const texture = useMemo(() => {
    const path = Skia.Path.Make();
    for (let row = 0; row < 30; row++)
      for (let col = 0; col < 20; col++) {
        const px = col * 18 + (row % 3) * 3;
        const py = row * 17;
        if (game === 'clay')
          path.moveTo(px, py + 5).quadTo(px + 8, py - 6, px + 15, py + 5);
        else if (game === 'window')
          path.moveTo(px, py).quadTo(px + 12, py + 8, px + 3, py + 15);
        else path.addCircle(px, py, game === 'wash' ? 4 + (col % 4) : 1.3);
      }
    return path;
  }, [game]);
  const cut = (from: Point, to: Point) => {
    'worklet';
    if (finished.value) return;
    x.value = to.x;
    y.value = to.y;
    coverage.modify((current) => {
      'worklet';
      const result = cutSegment(
        current,
        from,
        to,
        game === 'paint' ? 28 : game === 'wash' ? 22 : 30,
      );
      if (result.changed.length) {
        mask.modify((path) => {
          'worklet';
          appendCells(path, result.changed, result.justCompleted);
          return path;
        });
        if (game === 'paint') {
          const target = color === 0 ? paint0 : color === 1 ? paint1 : paint2;
          target.modify((path) => {
            'worklet';
            appendCells(path, result.changed, false);
            return path;
          });
        }
      }
      report(
        result.justCompleted ? 100 : (current.count / current.total) * 100,
      );
      return current;
    });
  };
  const gesture = useFieldGesture(
    scale,
    enabled,
    (p) => {
      'worklet';
      touching.value = 1;
      cut(p, p);
    },
    (a, b) => {
      'worklet';
      cut(a, b);
    },
    () => {
      'worklet';
      touching.value = 0;
    },
  );
  const topColor =
    game === 'window'
      ? '#D8E4E6'
      : game === 'wash'
        ? '#897B59'
        : game === 'reveal'
          ? '#B4A78E'
          : '#A87660';
  const layer = (
    <Group clip={mask} invertClip>
      <Rect x={0} y={0} width={320} height={448} color={topColor} />
      <Path
        path={texture}
        color={
          game === 'window'
            ? '#EBF0EB'
            : game === 'clay'
              ? '#D3A28B'
              : '#766C52'
        }
        style={game === 'clay' || game === 'window' ? 'stroke' : 'fill'}
        strokeWidth={game === 'clay' ? 5 : 2}
        opacity={0.7}
      />
    </Group>
  );
  return (
    <Field scale={scale} gesture={gesture} label={GAME_INFO[game].instruction}>
      <SurfaceUnderlay game={game} variation={variation} />
      {game === 'paint' ? (
        <>
          {/* Os resíduos recebem a cor escolhida; faixas anteriores mantêm suas cores. */}
          <Path path={mask} color={GAME_INFO.paint.colors![color]} />
          {[paint0, paint1, paint2].map((path, i) => (
            <Path key={i} path={path} color={GAME_INFO.paint.colors![i]} />
          ))}
        </>
      ) : game === 'wash' ? (
        <Group clip={vase}>{layer}</Group>
      ) : (
        layer
      )}
      <Group transform={transform}>
        {game === 'window' ? (
          <>
            <RoundedRect
              x={-25}
              y={-17}
              width={50}
              height={34}
              r={10}
              color="#668995"
            />
            <Path
              path="M-18 -7 L18 -7 M-18 2 L18 2 M-18 11 L18 11"
              style="stroke"
              strokeWidth={2}
              color="#BCD4D8"
            />
          </>
        ) : game === 'wash' ? (
          <>
            <Group opacity={touching}>
              {[-16, 0, 16].map((dx) => (
                <Circle key={dx} cx={dx} cy={-25} r={4} color="#B2DDE1" />
              ))}
            </Group>
            <RoundedRect
              x={-9}
              y={0}
              width={18}
              height={40}
              r={5}
              color="#557E86"
            />
            <Path path="M-8 0 L-20 -20 L20 -20 L8 0Z" color="#84BBC3" />
          </>
        ) : game === 'paint' ? (
          <>
            <RoundedRect
              x={-30}
              y={-15}
              width={60}
              height={27}
              r={7}
              color={GAME_INFO.paint.colors![color]}
            />
            <Path
              path="M30 0 L38 0 L38 24 L0 24 L0 40"
              color="#51685F"
              style="stroke"
              strokeWidth={4}
            />
          </>
        ) : game === 'clay' ? (
          <>
            <Path path="M-32 -17 L32 -17 L20 20 L-20 20Z" color="#CDD3C8" />
            <RoundedRect
              x={-7}
              y={15}
              width={14}
              height={30}
              r={4}
              color="#725846"
            />
          </>
        ) : (
          <>
            <RoundedRect
              x={-26}
              y={-20}
              width={52}
              height={25}
              r={4}
              color="#ECE0C1"
            />
            <Rect x={-26} y={2} width={52} height={9} color="#80978A" />
            <RoundedRect
              x={-8}
              y={10}
              width={16}
              height={35}
              r={5}
              color="#966849"
            />
          </>
        )}
      </Group>
    </Field>
  );
});
