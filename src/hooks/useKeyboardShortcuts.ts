import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

interface KeyEvent {
  key: string;
  preventDefault(): void;
  target?: { tagName?: string; isContentEditable?: boolean } | null;
}

interface WindowLike {
  addEventListener(type: 'keydown', handler: (event: KeyEvent) => void): void;
  removeEventListener(
    type: 'keydown',
    handler: (event: KeyEvent) => void,
  ): void;
}

function isTypingTarget(target: KeyEvent['target']): boolean {
  if (!target) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tag = target.tagName?.toLowerCase();

  return tag === 'input' || tag === 'textarea' || tag === 'select';
}

/**
 * Web-only keyboard shortcuts. Keys are ignored while a text field has focus,
 * so typing a fill-in-the-blank answer can never trigger an option.
 */
export function useKeyboardShortcuts(
  map: Record<string, () => void>,
  enabled = true,
): void {
  const handlers = useRef(map);

  useEffect(() => {
    handlers.current = map;
  });

  useEffect(() => {
    if (!enabled || Platform.OS !== 'web') {
      return;
    }

    const win = (globalThis as { window?: WindowLike }).window;

    if (!win) {
      return;
    }

    const onKeyDown = (event: KeyEvent) => {
      if (isTypingTarget(event.target)) {
        return;
      }

      const handler = handlers.current[event.key];

      if (!handler) {
        return;
      }

      event.preventDefault();
      handler();
    };

    win.addEventListener('keydown', onKeyDown);

    return () => win.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
