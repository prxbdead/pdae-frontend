import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(__dirname, '../../..');

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

interface WebManifest {
  name: string;
  short_name: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
}

interface RuntimeCachingEntry {
  urlPattern: RegExp | ((context: unknown) => boolean);
  handler: string;
  method?: string;
  options?: {
    cacheName?: string;
    networkTimeoutSeconds?: number;
  };
}

interface WorkboxConfig {
  swDest: string;
  navigateFallback: string;
  skipWaiting: boolean;
  clientsClaim: boolean;
  runtimeCaching: RuntimeCachingEntry[];
}

const readManifest = (): WebManifest =>
  JSON.parse(readFileSync(resolve(ROOT, 'public/manifest.json'), 'utf8'));

/** Reads width and height from a PNG's IHDR chunk. */
function readPngSize(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);

  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

describe('web app manifest', () => {
  it('parses and carries the Hodlo identity and brand colors', () => {
    const manifest = readManifest();

    expect(manifest.name).toBe('Hodlo');
    expect(manifest.short_name).toBe('Hodlo');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#6C4CF1');
    expect(manifest.background_color).toBe('#F5F2FF');
  });

  it('lists maskable 192 and 512 icons that exist at the declared size', () => {
    const icons = readManifest().icons;

    for (const [size, path] of [
      ['192x192', 'public/icons/icon-192.png'],
      ['512x512', 'public/icons/icon-512.png'],
    ] as const) {
      const icon = icons.find((entry) => entry.sizes === size);

      expect(icon).toBeDefined();
      expect(icon?.type).toBe('image/png');
      expect(icon?.purpose?.split(' ')).toEqual(
        expect.arrayContaining(['maskable']),
      );

      const { width, height } = readPngSize(resolve(ROOT, path));

      expect(`${width}x${height}`).toBe(size);
      expect(icon?.src).toBe(`/${path.replace('public/', '')}`);
    }
  });

  it('keeps the brand SVG and icon generator in the repo', () => {
    expect(() =>
      readFileSync(resolve(ROOT, 'assets/brand/icon.svg'), 'utf8'),
    ).not.toThrow();
    expect(() =>
      readFileSync(resolve(ROOT, 'scripts/generate-pwa-icons.mjs'), 'utf8'),
    ).not.toThrow();
  });
});

describe('workbox service worker config', () => {
  // workbox-config.js is CommonJS because the Workbox CLI loads it with require.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const config: WorkboxConfig = require('../../../workbox-config.js');

  const findRoute = (cacheName: string) =>
    config.runtimeCaching.find((entry) => entry.options?.cacheName === cacheName);

  const selfStub = { location: { origin: 'https://app.hodlo.test' } };

  beforeAll(() => {
    (globalThis as { self?: unknown }).self = selfStub;
  });

  afterAll(() => {
    delete (globalThis as { self?: unknown }).self;
  });

  it('writes dist/sw.js with SPA navigation fallback and page-controlled updates', () => {
    expect(config.swDest).toBe('dist/sw.js');
    expect(config.navigateFallback).toBe('/index.html');
    expect(config.skipWaiting).toBe(false);
    expect(config.clientsClaim).toBe(true);
  });

  it('uses NetworkFirst with a 3 second timeout for /content/pack', () => {
    const route = findRoute('hodlo-content');

    expect(route?.handler).toBe('NetworkFirst');
    expect(route?.options?.networkTimeoutSeconds).toBe(3);
    expect(
      (route?.urlPattern as RegExp).test('https://api.hodlo.test/content/pack'),
    ).toBe(true);
  });

  it('uses CacheFirst for same-origin static assets only', () => {
    const route = findRoute('hodlo-assets');
    const matches = route?.urlPattern as (context: unknown) => boolean;
    const request = (method: string) => ({ method });

    expect(route?.handler).toBe('CacheFirst');
    expect(
      matches({
        url: new URL('https://app.hodlo.test/assets/icon.png'),
        request: request('GET'),
      }),
    ).toBe(true);
    expect(
      matches({
        url: new URL('https://cdn.example.com/icon.png'),
        request: request('GET'),
      }),
    ).toBe(false);
  });

  it('never caches auth routes, POST requests, or user-specific API responses', () => {
    const authRoute = config.runtimeCaching.find(
      (entry) => entry.handler === 'NetworkOnly',
    );

    expect((authRoute?.urlPattern as RegExp).test('/auth/login')).toBe(true);
    expect(authRoute?.method).toBe('GET');

    // Only the content pack and static assets have runtime caches. Anything
    // else falls through to the network, so no per-user response is stored.
    const cacheNames = config.runtimeCaching
      .map((entry) => entry.options?.cacheName)
      .filter(Boolean);

    expect(cacheNames).toEqual(['hodlo-content', 'hodlo-assets']);

    const matches = config.runtimeCaching
      .filter((entry) => typeof entry.urlPattern === 'function')
      .map((entry) => entry.urlPattern as (context: unknown) => boolean);

    for (const matchesRequest of matches) {
      expect(
        matchesRequest({
          url: new URL('https://app.hodlo.test/assets/icon.png'),
          request: { method: 'POST' },
        }),
      ).toBe(false);
    }
  });
});
