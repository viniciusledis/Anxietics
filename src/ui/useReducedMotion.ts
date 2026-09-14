import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReducedMotion(preference: boolean) {
  // Até ler o sistema, opta pela apresentação estática.
  const [system, setSystem] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setSystem(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystem,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  return preference || system;
}
