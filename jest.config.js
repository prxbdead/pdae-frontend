module.exports = {
  preset: 'jest-expo',
  // Reanimated 4 needs its resolver so worklet `.native` files are skipped in Jest.
  resolver: '<rootDir>/node_modules/react-native-reanimated/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-router|@expo-google-fonts/.*|react-native-svg|@tanstack/.*|zustand))',
  ],
};
