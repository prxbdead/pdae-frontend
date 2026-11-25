import { act, renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';

import {
  captureInstallPrompt,
  resetInstallPromptForTests,
} from '../installPrompt';
import { useInstallPrompt } from '../useInstallPrompt';

type Handler = (event: unknown) => void;

/** A minimal window stand-in that records listeners so tests can fire events. */
function installFakeWindow(standalone = false) {
  const handlers = new Map<string, Handler[]>();
  const fakeWindow = {
    addEventListener: (type: string, handler: Handler) => {
      handlers.set(type, [...(handlers.get(type) ?? []), handler]);
    },
    matchMedia: () => ({ matches: standalone }),
  };

  Object.defineProperty(globalThis, 'window', {
    value: fakeWindow,
    configurable: true,
  });

  return {
    fire(type: string, event: unknown) {
      handlers.get(type)?.forEach((handler) => handler(event));
    },
  };
}

function makeInstallEvent() {
  return {
    preventDefault: jest.fn(),
    prompt: jest.fn(async () => undefined),
    userChoice: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
  };
}

describe('useInstallPrompt', () => {
  let originalWindow: unknown;

  beforeEach(() => {
    originalWindow = (globalThis as { window?: unknown }).window;
    resetInstallPromptForTests();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    });
    jest.restoreAllMocks();
  });

  it('never offers an install on native platforms', () => {
    expect(Platform.OS).not.toBe('web');

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.canInstall).toBe(false);
    expect(() => result.current.promptInstall()).not.toThrow();
  });

  it('offers install only after the browser fires beforeinstallprompt', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const fake = installFakeWindow();
    captureInstallPrompt();

    const { result } = renderHook(() => useInstallPrompt());

    expect(result.current.canInstall).toBe(false);

    const event = makeInstallEvent();

    act(() => {
      fake.fire('beforeinstallprompt', event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
    expect(result.current.canInstall).toBe(true);

    await act(async () => {
      await result.current.promptInstall();
    });

    expect(event.prompt).toHaveBeenCalledTimes(1);
    expect(result.current.canInstall).toBe(false);
  });

  it('hides the install action once the app is installed', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const fake = installFakeWindow();
    captureInstallPrompt();

    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      fake.fire('beforeinstallprompt', makeInstallEvent());
    });
    expect(result.current.canInstall).toBe(true);

    act(() => {
      fake.fire('appinstalled', {});
    });
    expect(result.current.canInstall).toBe(false);
  });

  it('hides the install action when the app already runs in standalone mode', () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const fake = installFakeWindow(true);
    captureInstallPrompt();

    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      fake.fire('beforeinstallprompt', makeInstallEvent());
    });

    expect(result.current.canInstall).toBe(false);
  });
});
