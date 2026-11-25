import { useCallback, useEffect, useState } from 'react';

export interface ServiceWorkerUpdate {
  /** True when a newer worker has installed and is waiting to take over. */
  updateAvailable: boolean;
  /** Activates the waiting worker and reloads once it controls the page. */
  applyUpdate(): void;
}

type ServiceWorkerNavigator = {
  serviceWorker?: ServiceWorkerContainer;
};

/**
 * Returns the service worker container on web, or undefined on native and in
 * tests without service worker support.
 */
function getContainer(): ServiceWorkerContainer | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return (navigator as ServiceWorkerNavigator).serviceWorker;
}

/**
 * Tracks the waiting-worker state for the "A new version is ready" banner.
 *
 * The first install (no controlling worker yet) never shows the banner, since
 * there is no old version to replace. Workbox runs with skipWaiting disabled,
 * so the new worker waits until the learner taps Refresh. applyUpdate then
 * posts SKIP_WAITING and reloads, which avoids swapping code under a lesson in
 * progress.
 */
export function useServiceWorkerUpdate(): ServiceWorkerUpdate {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration>();

  useEffect(() => {
    const container = getContainer();

    if (!container) {
      return undefined;
    }

    let active = true;
    const cleanups: (() => void)[] = [];

    const markIfWaiting = (candidate: ServiceWorkerRegistration) => {
      if (active && candidate.waiting && container.controller) {
        setUpdateAvailable(true);
      }
    };

    const watchInstalling = (candidate: ServiceWorkerRegistration) => {
      const onUpdateFound = () => {
        const installing = candidate.installing;

        if (!installing) {
          return;
        }

        const onStateChange = () => {
          if (installing.state === 'installed') {
            markIfWaiting(candidate);
          }
        };

        installing.addEventListener('statechange', onStateChange);
        cleanups.push(() =>
          installing.removeEventListener('statechange', onStateChange),
        );
      };

      candidate.addEventListener('updatefound', onUpdateFound);
      cleanups.push(() =>
        candidate.removeEventListener('updatefound', onUpdateFound),
      );
    };

    void container.getRegistration().then((found) => {
      if (!active || !found) {
        return;
      }

      setRegistration(found);
      markIfWaiting(found);
      watchInstalling(found);
    });

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  const applyUpdate = useCallback(() => {
    const container = getContainer();
    const waiting = registration?.waiting;

    if (!container || !waiting) {
      return;
    }

    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) {
        return;
      }

      reloaded = true;
      container.removeEventListener('controllerchange', onControllerChange);
      window.location.reload();
    };

    container.addEventListener('controllerchange', onControllerChange);
    waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [registration]);

  return { updateAvailable, applyUpdate };
}
