/**
 * Test Setup
 */

import { Logger } from '../core/logger';

// Suppress logs during tests
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  // Optionally suppress logs
  // console.log = jest.fn();
  // console.error = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// Global test timeout
jest.setTimeout(10000);
