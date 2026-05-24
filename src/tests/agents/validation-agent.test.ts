/**
 * Validation Agent Tests
 */

import { ValidationAgent } from '../../agents/validation-agent';

describe('ValidationAgent', () => {
  let agent: ValidationAgent;

  beforeEach(() => {
    agent = new ValidationAgent();
  });

  test('should initialize agent', () => {
    expect(agent.getName()).toBe('ValidationAgent');
  });

  test('should have execute method', () => {
    expect(typeof agent.execute).toBe('function');
  });
});
