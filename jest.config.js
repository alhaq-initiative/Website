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
  
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  modulePathIgnorePatterns: [
  
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
  
  ],
  watchPathIgnorePatterns: [
    
  ],
};
