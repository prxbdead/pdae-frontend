import { ensureWebAppHead, registerServiceWorker } from '../registerServiceWorker';

function makeHead(existing: string[] = []) {
  const links: Record<string, string>[] = existing.map((rel) => ({ rel }));

  return {
    links,
    querySelector: (selector: string) => {
      const rel = /rel="([^"]+)"/.exec(selector)?.[1];

      return links.find((link) => link.rel === rel) ? {} : null;
    },
    appendChild: jest.fn((node: Record<string, string>) => {
      links.push(node);
    }),
  };
}

function makeDocument(head: ReturnType<typeof makeHead>) {
  return {
    head,
    createElement: () => ({} as Record<string, string>),
  } as unknown as Document;
}

describe('ensureWebAppHead', () => {
  it('adds the manifest and apple touch icon links when the template lacks them', () => {
    const head = makeHead();

    ensureWebAppHead(makeDocument(head));

    expect(head.links).toEqual([
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'apple-touch-icon', href: '/icons/icon-192.png' },
    ]);
  });

  it('does not duplicate links that already exist', () => {
    const head = makeHead(['manifest', 'apple-touch-icon']);

    ensureWebAppHead(makeDocument(head));

    expect(head.appendChild).not.toHaveBeenCalled();
  });
});

describe('registerServiceWorker', () => {
  it('registers /sw.js', async () => {
    const register = jest.fn(async () => ({ scope: '/' }));

    await registerServiceWorker({
      register,
    } as unknown as ServiceWorkerContainer);

    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('resolves without throwing when the browser refuses the registration', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const container = {
      register: jest.fn(async () => {
        throw new Error('insecure context');
      }),
    } as unknown as ServiceWorkerContainer;

    await expect(registerServiceWorker(container)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('does nothing when service workers are unavailable', async () => {
    await expect(registerServiceWorker(undefined)).resolves.toBeUndefined();
  });
});
