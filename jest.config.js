module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/**/__tests__/**/*.js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!node_modules/**',
    '!tests/**',
    '!coverage/**',
  '!deenshield/web-app/src/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  modulePathIgnorePatterns: [
  '<rootDir>/deenshield/web-app/',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  '/deenshield/web-app/'
  ],
  watchPathIgnorePatterns: [
    '/deenshield/web-app/'
  ],
};
