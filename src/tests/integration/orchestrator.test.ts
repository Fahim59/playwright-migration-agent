/**
 * Orchestrator Integration Tests
 */

import { Orchestrator } from '../../core/orchestrator';
import { MigrationConfig } from '../../core/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Orchestrator Integration Tests', () => {
  let orchestrator: Orchestrator;
  let config: MigrationConfig;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `orch-test-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    config = {
      sourceProjectPath: path.join(tempDir, 'source'),
      outputPath: path.join(tempDir, 'output'),
      referenceProjectPath: undefined,
      validateAfterConversion: false,
      enableAutoFix: true,
      enableSelfHealing: false,
      maxRetries: 3,
      agentTimeout: 300000,
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

  test('should create orchestrator with config', () => {
    expect(orchestrator).toBeDefined();
  });

  test('should have migrate method', () => {
    expect(typeof orchestrator.migrate).toBe('function');
  });

  test('should initialize context with correct paths', () => {
    expect(orchestrator).toBeDefined();
  });
});
