/**
 * Type Inference Agent Tests
 */

import { TypeInferenceAgent } from '../../agents/type-inference-agent';
import { AgentContext } from '../../core/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('TypeInferenceAgent', () => {
  let agent: TypeInferenceAgent;
  let context: AgentContext;
  let tempDir: string;

  beforeEach(() => {
    agent = new TypeInferenceAgent();
    tempDir = path.join(os.tmpdir(), `type-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    context = {
      projectPath: path.join(tempDir, 'src'),
      outputPath: path.join(tempDir, 'output'),
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
            metrics: { linesOfCode: 10, typeAnnotations: 0, imports: 0, exports: 0, complexity: 1 },
          },
        ],
      ]),
      errors: [],
      metadata: {},
    };
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should initialize agent', () => {
    expect(agent.getName()).toBe('TypeInferenceAgent');
  });

  test('should infer types from code', async () => {
    const code = `
      const name = 'John';
      const age = 30;
      const isActive = true;
      const items = [1, 2, 3];
    `;

    fs.mkdirSync(context.outputPath, { recursive: true });
    fs.writeFileSync(path.join(context.outputPath, 'test.ts'), code);

    const result = await agent.execute(context);
    expect(result.metadata.typeMappings).toBeDefined();
  });
});
