/* eslint-disable @typescript-eslint/no-require-imports -- jest.mock factories cannot close over imports */

/**
 * Shared Jest setup.
 *
 * Native modules that have no JS implementation in the test environment are
 * mocked here once, so individual tests never have to.
 */

jest.mock('expo-font', () => {
  const actual = jest.requireActual('expo-font');

  return {
    ...actual,
    isLoaded: jest.fn(() => true),
    loadAsync: jest.fn(async () => undefined),
    useFonts: jest.fn(() => [true, null]),
  };
});

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(async () => true),
  hideAsync: jest.fn(async () => true),
  setOptions: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => undefined),
  impactAsync: jest.fn(async () => undefined),
  selectionAsync: jest.fn(async () => undefined),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-crypto', () => ({
  randomUUID: () => 'test-uuid',
}));

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);

jest.mock('@react-native-async-storage/async-storage', () => {
  const mock = require('@react-native-async-storage/async-storage/jest/async-storage-mock');

  return { __esModule: true, default: mock, ...mock };
});

beforeEach(async () => {
  const AsyncStorage =
    require('@react-native-async-storage/async-storage').default;

  await AsyncStorage.clear();
});
