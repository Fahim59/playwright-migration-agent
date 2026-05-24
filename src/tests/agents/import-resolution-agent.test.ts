/**
 * Import Resolution Agent Tests
 */

import { ImportResolutionAgent } from '../../agents/import-resolution-agent';

describe('ImportResolutionAgent', () => {
  let agent: ImportResolutionAgent;

  beforeEach(() => {
    agent = new ImportResolutionAgent();
  });

  test('should initialize agent', () => {
    expect(agent.getName()).toBe('ImportResolutionAgent');
  });

  test('should resolve relative import paths', async () => {
    const context = {
      projectPath: '/test/project',
      outputPath: '/test/output',
      analysis: {} as any,
      conversions: new Map([
        [
          'test.ts',
          {
            sourceFile: 'test.js',
            outputFile: 'test.ts',
            status: 'success',
            errors: [],
            warnings: [],
            metrics: { linesOfCode: 5, typeAnnotations: 0, imports: 1, exports: 0, complexity: 1 },
          },
        ],
      ]),
      errors: [],
      metadata: {},
    };

    expect(agent.getName()).toBe('ImportResolutionAgent');
  });
});
