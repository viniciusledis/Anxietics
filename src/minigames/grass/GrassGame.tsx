import { memo, useMemo } from 'react';
import { View } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Path,
  Rect,
  RoundedRect,
  Skia,
} from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import { GRASS_VARIATIONS } from '../../trail/stages';
import { makeGrassArt } from './art';
import {
  CELL_SIZE,
  COLUMNS,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  Point,
  TOTAL_CELLS,
  clampPoint,
  createCoverage,
  cutSegment,
} from './coverage';

import { GameProps } from '../types';

export const GrassGame = memo(function GrassGame({
  variation,
  scale,
  enabled,
  onProgress,
  onComplete,
}: GameProps) {
  const stage = GRASS_VARIATIONS[variation % 3]!;
  const initial = useMemo(createCoverage, []);
  const coverage = useSharedValue(initial);
  const cutPath = useSharedValue(Skia.Path.Make());
  const previous = useSharedValue<Point | null>(null);
  const mowerX = useSharedValue(FIELD_WIDTH / 2);
  const mowerY = useSharedValue(FIELD_HEIGHT * 0.68);
  const reportedPercent = useSharedValue(0);
  const art = useMemo(() => makeGrassArt(stage.variation), [stage.variation]);
  const mowerTransform = useDerivedValue(() => [
    { translateX: mowerX.value },
    { translateY: mowerY.value },
  ]);

  const move = (x: number, y: number, start: boolean) => {
    'worklet';
    if (coverage.value.completed) return;
    const point = clampPoint({ x: x / scale, y: y / scale });
    const from = start || previous.value === null ? point : previous.value;
    mowerX.value = point.x;
    mowerY.value = point.y;
    previous.value = point;
    coverage.modify((current) => {
      'worklet';
      const { changed, justCompleted } = cutSegment(current, from, point);

      if (changed.length > 0) {
        cutPath.modify((path) => {
          'worklet';
          if (justCompleted) {
            path.reset();
            path.addRect({
              x: 0,
              y: 0,
              width: FIELD_WIDTH,
              height: FIELD_HEIGHT,
            });
          } else {
            // Junta células contíguas da mesma linha em um retângulo.
            // Nenhuma região já cortada adiciona geometria: memória limitada pelo campo.
            for (let i = 0; i < changed.length; i++) {
              const first = changed[i]!;
              let last = first;
              while (
                i + 1 < changed.length &&
                changed[i + 1] === last + 1 &&
                Math.floor(changed[i + 1]! / COLUMNS) ===
                  Math.floor(first / COLUMNS)
              ) {
                last = changed[++i]!;
              }
              path.addRect({
                x: (first % COLUMNS) * CELL_SIZE,
                y: Math.floor(first / COLUMNS) * CELL_SIZE,
                width: (last - first + 1) * CELL_SIZE,
                height: CELL_SIZE,
              });
            }
          }
          return path;
        });
      }
      const percent = justCompleted
        ? 100
        : Math.floor((current.count / TOTAL_CELLS) * 100);
      if (percent !== reportedPercent.value) {
        reportedPercent.value = percent;
        runOnJS(onProgress)(percent);
      }
      if (justCompleted) runOnJS(onComplete)();
      return current;
    });
  };

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .minDistance(0)
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    .onBegin((event) => {
      move(event.x, event.y, true);
    })
    .onUpdate((event) => {
      if (event.numberOfPointers !== 1) {
        previous.value = null;
        return;
      }
      move(event.x, event.y, false);
    })
    .onEnd((event, success) => {
      if (success) move(event.x, event.y, false);
    })
    .onFinalize(() => {
      previous.value = null;
    });

  return (
    <GestureDetector gesture={gesture}>
      <View
        collapsable={false}
        accessible
        accessibilityRole="image"
        accessibilityLabel="Campo de grama. Arraste um dedo para cortar. O percentual fica acima do campo."
        style={{ width: FIELD_WIDTH * scale, height: FIELD_HEIGHT * scale }}
      >
        <Canvas
          style={{ width: FIELD_WIDTH * scale, height: FIELD_HEIGHT * scale }}
        >
          <Group transform={[{ scale }]}>
            <Rect
              x={0}
              y={0}
              width={FIELD_WIDTH}
              height={FIELD_HEIGHT}
              color={stage.palette.cut}
            />
            <Path path={art.pattern} color={stage.palette.stripe} />
            <Group clip={cutPath} invertClip>
              <Rect
                x={0}
                y={0}
                width={FIELD_WIDTH}
                height={FIELD_HEIGHT}
                color={stage.palette.tall}
              />
              <Path
                path={art.pattern}
                color={stage.palette.highlight}
                opacity={0.18}
              />
              <Path
                path={art.blades}
                style="stroke"
                strokeWidth={1.6}
                strokeCap="round"
                strokeJoin="round"
                color={stage.palette.blade}
              />
              <Path
                path={art.highlights}
                style="stroke"
                strokeWidth={1.4}
                strokeCap="round"
                color={stage.palette.highlight}
              />
            </Group>
            <Group transform={mowerTransform}>
              <Circle cx={0} cy={0} r={25} color="#FFFBE0" opacity={0.2} />
              <RoundedRect
                x={-20}
                y={-12}
                width={9}
                height={26}
                r={4}
                color="#233C32"
              />
              <RoundedRect
                x={11}
                y={-12}
                width={9}
                height={26}
                r={4}
                color="#233C32"
              />
              <RoundedRect
                x={-15}
                y={-20}
                width={30}
                height={40}
                r={10}
                color="#274D38"
              />
              <RoundedRect
                x={-14}
                y={-21}
                width={28}
                height={33}
                r={9}
                color="#E8C86D"
              />
              <RoundedRect
                x={-9}
                y={-17}
                width={18}
                height={10}
                r={4}
                color="#F5DE9C"
              />
              <Circle cx={0} cy={2} r={5} color="#7C703F" />
              <RoundedRect
                x={-9}
                y={14}
                width={18}
                height={4}
                r={2}
                color="#F2DB99"
              />
            </Group>
          </Group>
        </Canvas>
      </View>
    </GestureDetector>
  );
});
