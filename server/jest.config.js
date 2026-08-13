/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  // Runs before any test module is imported, so env vars the app reads at
  // module load (e.g. JWT_SECRET in the auth controllers) are always set.
  setupFiles: ['<rootDir>/src/tests/setupEnv.ts'],
  testMatch: ['**/src/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/tests/**',
    '!src/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
};