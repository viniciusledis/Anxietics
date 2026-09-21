import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { GRASS_VARIATIONS } from '../../trail/stages';
import { GameProps } from '../types';
import {
  Point,
  TOTAL_CELLS,
  createCoverage,
  cutSegment,
} from './coverage';
import { LawnController } from './three/LawnController';
import { LawnScene } from './three/LawnScene';
import { screenToLogical } from './three/sceneModel';

export const GrassGame3D = memo(function GrassGame3D({
  variation,
  enabled,
  reducedMotion,
  grassEquipment,
  onProgress,
  onComplete,
}: GameProps) {
  const palette = GRASS_VARIATIONS[variation % GRASS_VARIATIONS.length]!.palette;
  const controller = useMemo(() => new LawnController(), []);
  const coverage = useMemo(createCoverage, []);
  const previous = useRef<Point | null>(null);
  const reported = useRef(0);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => () => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
    controller.camera = null;
  }, [controller]);

  const move = (x: number, y: number, start: boolean) => {
    if (!enabled || coverage.completed) return;
    const point = screenToLogical(
      x,
      y,
      size.width,
      size.height,
      controller.camera,
    );
    if (!point) return;
    const from = start || previous.current === null ? point : previous.current;
    previous.current = point;
    controller.move(point);
    const result = cutSegment(
      coverage,
      from,
      point,
      grassEquipment?.radius ?? 25,
    );
    controller.cut(result.changed, point);
    const percent = result.justCompleted
      ? 100
      : Math.floor((coverage.count / TOTAL_CELLS) * 100);
    if (percent !== reported.current) {
      reported.current = percent;
      onProgress(percent);
      if (!result.justCompleted) {
        while (percent >= (controller.milestones + 1) * 25)
          controller.milestone(point);
      }
    }
    if (result.justCompleted) {
      controller.moving = false;
      controller.celebrate();
      finishTimer.current = setTimeout(onComplete, reducedMotion ? 0 : 1050);
    }
  };

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .runOnJS(true)
    .minDistance(0)
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    .onBegin((event) => move(event.x, event.y, true))
    .onUpdate((event) => {
      if (event.numberOfPointers !== 1) {
        previous.current = null;
        return;
      }
      move(event.x, event.y, false);
    })
    .onEnd((event, success) => {
      if (success) move(event.x, event.y, false);
    })
    .onFinalize(() => {
      previous.current = null;
      controller.moving = false;
    });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize((current) => current.width === width && current.height === height
      ? current
      : { width, height });
  };

  return (
    <View style={styles.root} onLayout={onLayout}>
      <LawnScene
        controller={controller}
        palette={palette}
        mowerColor={grassEquipment?.color ?? '#E8C86D'}
        mowerWidth={grassEquipment?.width ?? 1}
        active={enabled}
        reducedMotion={reducedMotion}
      />
      <GestureDetector gesture={gesture}>
        <View
          collapsable={false}
          accessible
          accessibilityRole="image"
          accessibilityLabel="Jardim 3D. Arraste um dedo pelo gramado para mover o cortador. O percentual fica acima do jardim."
          style={StyleSheet.absoluteFill}
        />
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  root: { width: '100%', height: '100%', overflow: 'hidden' },
});
