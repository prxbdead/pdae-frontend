import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { useKeyboardShortcuts } from '../useKeyboardShortcuts';

interface KeyEvent {
  key: string;
  preventDefault(): void;
  target?: { tagName?: string; isContentEditable?: boolean } | null;
}

type Handler = (event: KeyEvent) => void;

const originalOS = Platform.OS;
const originalWindow = (globalThis as { window?: unknown }).window;

let listeners: Handler[];
let windowMock: {
  addEventListener: jest.Mock;
  removeEventListener: jest.Mock;
};

function dispatch(event: KeyEvent): void {
  listeners.forEach((listener) => listener(event));
}

beforeEach(() => {
  listeners = [];
  windowMock = {
    addEventListener: jest.fn((_type: string, handler: Handler) => {
      listeners.push(handler);
    }),
    removeEventListener: jest.fn((_type: string, handler: Handler) => {
      listeners = listeners.filter((entry) => entry !== handler);
    }),
  };

  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: 'web',
  });
  (globalThis as { window?: unknown }).window = windowMock;
});

afterEach(() => {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    value: originalOS,
  });
  (globalThis as { window?: unknown }).window = originalWindow;
});

describe('useKeyboardShortcuts', () => {
  it('runs the mapped action for a key', () => {
    const onOne = jest.fn();

    renderHook(() =>
      useKeyboardShortcuts({ '1': onOne }, true),
    );

    dispatch({ key: '1', preventDefault: jest.fn(), target: null });

    expect(onOne).toHaveBeenCalledTimes(1);
  });

  it('maps Enter to the primary action', () => {
    const onEnter = jest.fn();

    renderHook(() => useKeyboardShortcuts({ Enter: onEnter }));

    dispatch({ key: 'Enter', preventDefault: jest.fn(), target: null });

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('ignores keys while a text field has focus', () => {
    const onOne = jest.fn();

    renderHook(() => useKeyboardShortcuts({ '1': onOne }));

    dispatch({
      key: '1',
      preventDefault: jest.fn(),
      target: { tagName: 'INPUT' },
    });
    dispatch({
      key: '1',
      preventDefault: jest.fn(),
      target: { tagName: 'DIV', isContentEditable: true },
    });

    expect(onOne).not.toHaveBeenCalled();
  });

  it('does not attach listeners when disabled', () => {
    renderHook(() => useKeyboardShortcuts({ '1': jest.fn() }, false));

    expect(windowMock.addEventListener).not.toHaveBeenCalled();
  });

  it('removes the listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({ '1': jest.fn() }),
    );

    expect(windowMock.addEventListener).toHaveBeenCalledTimes(1);

    unmount();

    expect(windowMock.removeEventListener).toHaveBeenCalled();
  });
});
