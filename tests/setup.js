require('@testing-library/jest-dom');

// Mock browser APIs that might not be available in Jest environment
global.fetch = require('jest-fetch-mock');

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'jest',
    geolocation: {
      getCurrentPosition: jest.fn(),
    },
  },
  writable: true,
});

// Console cleanup for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Not implemented: navigation'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
