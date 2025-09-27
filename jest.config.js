const path = require('path');
module.exports = {
  testEnvironment: 'jsdom',
  // Note: inline setup in tests to avoid Windows path resolution issues
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
