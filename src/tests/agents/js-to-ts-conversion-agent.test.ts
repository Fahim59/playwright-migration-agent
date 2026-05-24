/**
 * JS to TS Conversion Agent Tests
 */

import { JsToTsConversionAgent } from '../../agents/js-to-ts-conversion-agent';
import { AgentContext } from '../../core/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('JsToTsConversionAgent', () => {
  let agent: JsToTsConversionAgent;
  let context: AgentContext;
  let tempDir: string;

  beforeEach(() => {
    agent = new JsToTsConversionAgent();
    tempDir = path.join(os.tmpdir(), `test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    context = {
      projectPath: path.join(tempDir, 'src'),
      outputPath: path.join(tempDir, 'output'),
      analysis: {
        rootPath: path.join(tempDir, 'src'),
        files: [
          {
            path: 'index.js',
            name: 'index.js',
            extension: '.js',
            size: 200,
            content: `
              const LoginPage = require('./pages/LoginPage');
              module.exports = { LoginPage };
            `,
            type: 'utility',
          },
        ],
        folders: [],
        packageJson: { name: 'test', version: '1.0.0', dependencies: {}, devDependencies: {}, scripts: {} },
        playwrightConfig: { testDir: '.', timeout: 300000, workers: 1, browsers: ['chromium'], reporters: ['list'] },
      } as any,
      conversions: new Map(),
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
    expect(agent.getName()).toBe('JsToTsConversionAgent');
  });

  test('should convert require to import', async () => {
    fs.mkdirSync(context.projectPath, { recursive: true });
    fs.mkdirSync(context.outputPath, { recursive: true });
    fs.writeFileSync(
      path.join(context.projectPath, 'index.js'),
      context.analysis.files[0].content
    );

    const result = await agent.execute(context);
    expect(result.conversions.size).toBeGreaterThan(0);
  });

  test('should convert module.exports to export', async () => {
    const code = `
      const x = 42;
      module.exports = { x };
    `;

    fs.mkdirSync(context.projectPath, { recursive: true });
    fs.mkdirSync(context.outputPath, { recursive: true });
    fs.writeFileSync(path.join(context.projectPath, 'test.js'), code);

    context.analysis.files = [
      {
        path: 'test.js',
        name: 'test.js',
        extension: '.js',
        size: 100,
        content: code,
        type: 'utility',
      },
    ];

    const result = await agent.execute(context);
    expect(result.conversions.size).toBeGreaterThan(0);
  });
});
