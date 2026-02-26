module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/workers/**'],
  coverageDirectory: 'coverage',
  globals: {
    'ts-jest': {
      tsconfig: {
        strict: false
      }
    }
  }
};
