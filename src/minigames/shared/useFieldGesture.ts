import { useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { Point, clampPoint } from '../grass/coverage';

// Os callbacks são worklets. Nenhum movimento atualiza a árvore React.
export function useFieldGesture(
  scale: number,
  enabled: boolean,
  start: (point: Point) => void,
  move: (from: Point, to: Point) => void,
  end: (point: Point, success: boolean) => void,
) {
  const previous = useSharedValue<Point | null>(null);
  useEffect(() => {
    previous.value = null;
  }, [enabled, scale, previous]);
  return Gesture.Pan()
    .enabled(enabled)
    .minDistance(0)
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    .onBegin((event) => {
      const p = clampPoint({ x: event.x / scale, y: event.y / scale });
      previous.value = p;
      start(p);
    })
    .onUpdate((event) => {
      if (event.numberOfPointers !== 1) {
        if (previous.value) end(previous.value, false);
        previous.value = null;
        return;
      }
      const p = clampPoint({ x: event.x / scale, y: event.y / scale });
      if (previous.value) move(previous.value, p);
      else start(p);
      previous.value = p;
    })
    .onEnd((event, success) => {
      if (!previous.value) return;
      const p = clampPoint({ x: event.x / scale, y: event.y / scale });
      if (success) move(previous.value, p);
      end(p, success);
      previous.value = null;
    })
    .onFinalize(() => {
      if (previous.value) end(previous.value, false);
      previous.value = null;
    });
}
