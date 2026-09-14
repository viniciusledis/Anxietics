import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { GameProps } from '../types';

export function useFeedback({
  onProgress,
  onComplete,
}: Pick<GameProps, 'onProgress' | 'onComplete'>) {
  const last = useSharedValue(0);
  const finished = useSharedValue(false);
  const report = (value: number) => {
    'worklet';
    if (finished.value) return;
    const percent = Math.max(0, Math.min(100, Math.floor(value)));
    if (last.value !== percent) {
      last.value = percent;
      runOnJS(onProgress)(percent);
    }
    if (percent >= 100) {
      finished.value = true;
      runOnJS(onComplete)();
    }
  };
  return { report, finished };
}
