/**
 * Shared expo-router stand-in for unit tests. Tests call `jest.mock('expo-router',
 * () => require('@/testing/expo-router-mock'))` and then assert on `routerMock`.
 */
export const routerMock = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
};

let currentPathname = '/learn';
let currentSegments: string[] = [];

export function setPathname(pathname: string): void {
  currentPathname = pathname;
}

export function setSegments(segments: string[]): void {
  currentSegments = segments;
}

export function useRouter() {
  return routerMock;
}

export function usePathname(): string {
  return currentPathname;
}

export function useSegments(): string[] {
  return currentSegments;
}
