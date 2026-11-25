import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useServiceWorkerUpdate } from '../useServiceWorkerUpdate';

type Listener = (event?: unknown) => void;

function makeWorker(state: ServiceWorkerState = 'activated') {
  const listeners = new Map<string, Set<Listener>>();

  return {
    state,
    postMessage: jest.fn(),
    addEventListener: jest.fn((type: string, listener: Listener) => {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type)?.add(listener);
    }),
    removeEventListener: jest.fn((type: string, listener: Listener) => {
      listeners.get(type)?.delete(listener);
    }),
    emit(type: string) {
      listeners.get(type)?.forEach((listener) => listener());
    },
  };
}

function installServiceWorker(
  registration: Record<string, unknown> | undefined,
  controller: unknown,
) {
  const container = {
    controller,
    getRegistration: jest.fn(async () => registration),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };

  Object.defineProperty(globalThis.navigator, 'serviceWorker', {
    value: container,
    configurable: true,
  });

  return container;
}

function makeRegistration(extra: Record<string, unknown>) {
  return {
    waiting: null as unknown,
    installing: null as unknown,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    ...extra,
  };
}

function removeServiceWorker() {
  delete (globalThis.navigator as { serviceWorker?: unknown }).serviceWorker;
}

describe('useServiceWorkerUpdate', () => {
  afterEach(() => {
    removeServiceWorker();
  });

  it('reports no update when service workers are unsupported', async () => {
    removeServiceWorker();

    const { result } = renderHook(() => useServiceWorkerUpdate());

    expect(result.current.updateAvailable).toBe(false);
  });

  it('reports an update when a worker is waiting and a worker controls the page', async () => {
    const waiting = makeWorker('installed');
    installServiceWorker(makeRegistration({ waiting, installing: null }), {});

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(() => expect(result.current.updateAvailable).toBe(true));
  });

  it('stays quiet on the first install, when no worker controls the page yet', async () => {
    const waiting = makeWorker('installed');
    installServiceWorker(makeRegistration({ waiting, installing: null }), null);

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(() => expect(navigator.serviceWorker).toBeDefined());
    expect(result.current.updateAvailable).toBe(false);
  });

  it('reports an update when a newly installed worker starts waiting', async () => {
    const installing = makeWorker('installing');
    const registration = {
      waiting: null as unknown,
      installing: null as unknown,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    installServiceWorker(registration, {});

    const { result } = renderHook(() => useServiceWorkerUpdate());

    await waitFor(() =>
      expect(registration.addEventListener).toHaveBeenCalledWith(
        'updatefound',
        expect.any(Function),
      ),
    );

    // The browser finds an update: the new worker installs and then waits.
    const onUpdateFound = (registration.addEventListener as jest.Mock).mock
      .calls.find(([type]) => type === 'updatefound')?.[1] as Listener;

    registration.installing = installing;
    registration.waiting = installing;
    const stateListeners: Listener[] = [];
    installing.addEventListener.mockImplementation(
      (type: string, listener: Listener) => {
        if (type === 'statechange') {
          stateListeners.push(listener);
        }
      },
    );

    act(() => {
      onUpdateFound();
    });
    (installing as { state: ServiceWorkerState }).state = 'installed';
    act(() => {
      stateListeners.forEach((listener) => listener());
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it('posts SKIP_WAITING to the waiting worker and reloads once it takes control', async () => {
    const waiting = makeWorker('installed');
    const container = installServiceWorker(
      makeRegistration({ waiting, installing: null }),
      {},
    );
    const reload = jest.fn();
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload },
      configurable: true,
    });

    try {
      const { result } = renderHook(() => useServiceWorkerUpdate());

      await waitFor(() => expect(result.current.updateAvailable).toBe(true));

      act(() => {
        result.current.applyUpdate();
      });

      expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

      const onControllerChange = (
        container.addEventListener as jest.Mock
      ).mock.calls.find(([type]) => type === 'controllerchange')?.[1] as Listener;

      expect(onControllerChange).toBeDefined();

      act(() => {
        onControllerChange();
        onControllerChange();
      });

      expect(reload).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    }
  });
});
