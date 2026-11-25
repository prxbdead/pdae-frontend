import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { useSettingsStore } from '@/stores/settingsStore';

function readWebPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useSystemReducedMotion(): boolean {
  const [systemReduced, setSystemReduced] = useState<boolean>(() =>
    Platform.OS === 'web' ? readWebPreference() : false,
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined' || !window.matchMedia) {
        return;
      }

      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      const onChange = (event: MediaQueryListEvent) =>
        setSystemReduced(event.matches);

      query.addEventListener('change', onChange);

      return () => query.removeEventListener('change', onChange);
    }

    let active = true;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (active) {
        setSystemReduced(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setSystemReduced,
    );

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return systemReduced;
}

/**
 * True when either the OS or the in-app setting asks for reduced motion.
 * Reward and press animations must degrade to fades or static poses.
 */
export function useReducedMotion(): boolean {
  const settingReduced = useSettingsStore((state) => state.reducedMotion);
  const systemReduced = useSystemReducedMotion();

  return settingReduced || systemReduced;
}
