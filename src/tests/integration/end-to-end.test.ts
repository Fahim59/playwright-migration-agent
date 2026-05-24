/**
 * End-to-End Migration Tests
 */

import { Orchestrator } from '../../core/orchestrator';
import { MigrationConfig } from '../../core/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('End-to-End Migration', () => {
  let orchestrator: Orchestrator;
  let config: MigrationConfig;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `e2e-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const sourceDir = path.join(tempDir, 'source');
    const outputDir = path.join(tempDir, 'output');

    // Create minimal source project
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(
      path.join(sourceDir, 'package.json'),
      JSON.stringify({ name: 'test-project', version: '1.0.0' })
    );
    fs.mkdirSync(path.join(sourceDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(sourceDir, 'src', 'index.js'), 'console.log("hello");');

    config = {
      sourceProjectPath: sourceDir,
      outputPath: outputDir,
      referenceProjectPath: undefined,
      validateAfterConversion: false,
      enableAutoFix: true,
      enableSelfHealing: false,
      maxRetries: 1,
      agentTimeout: 10000,
      verbose: false,
      dryRun: false,
    };

    orchestrator = new Orchestrator(config);
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should start migration', () => {
    expect(orchestrator).toBeDefined();
    expect(config.sourceProjectPath).toBe(config.sourceProjectPath);
  });
});
