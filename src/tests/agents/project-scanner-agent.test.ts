/**
 * Project Scanner Agent Tests
 */

import { ProjectScannerAgent } from '../../agents/project-scanner-agent';
import { AgentContext } from '../../core/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('ProjectScannerAgent', () => {
  let agent: ProjectScannerAgent;
  let testProjectPath: string;
  let context: AgentContext;

  beforeEach(() => {
    agent = new ProjectScannerAgent();
    testProjectPath = path.join(os.tmpdir(), 'test-project');
    context = {
      projectPath: testProjectPath,
      outputPath: path.join(os.tmpdir(), 'test-output'),
      analysis: {} as any,
      conversions: new Map(),
      errors: [],
      metadata: {},
    };
  });

  afterEach(() => {
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
  });

  test('should initialize agent with default config', () => {
    expect(agent.getName()).toBe('ProjectScannerAgent');
  });

  test('should validate context before execution', async () => {
    const invalidContext = {
      projectPath: '',
      outputPath: '',
      analysis: {} as any,
      conversions: new Map(),
      errors: [],
      metadata: {},
    };

    await expect(agent.execute(invalidContext)).rejects.toThrow();
  });

  test('should scan project structure', async () => {
    // Create test project structure
    fs.mkdirSync(testProjectPath, { recursive: true });
    fs.writeFileSync(
      path.join(testProjectPath, 'package.json'),
      JSON.stringify({ name: 'test-project', version: '1.0.0' })
    );
    fs.mkdirSync(path.join(testProjectPath, 'src'), { recursive: true });
    fs.writeFileSync(path.join(testProjectPath, 'src', 'index.js'), 'console.log("test");');
    fs.mkdirSync(path.join(testProjectPath, 'tests'), { recursive: true });
    fs.writeFileSync(path.join(testProjectPath, 'tests', 'test.js'), 'describe("test", () => {});');

    context.outputPath = path.join(os.tmpdir(), 'scan-output');
    const result = await agent.execute(context);

    expect(result.analysis).toBeDefined();
    expect(result.analysis.files.length).toBeGreaterThan(0);
    expect(result.analysis.packageJson.name).toBe('test-project');
  });

  test('should identify file types correctly', async () => {
    fs.mkdirSync(testProjectPath, { recursive: true });
    fs.writeFileSync(path.join(testProjectPath, 'package.json'), '{}');
    fs.mkdirSync(path.join(testProjectPath, 'tests'), { recursive: true });
    fs.writeFileSync(path.join(testProjectPath, 'tests', 'test.fixture.js'), '');
    fs.writeFileSync(path.join(testProjectPath, 'tests', 'login.spec.js'), '');
    fs.mkdirSync(path.join(testProjectPath, 'pages'), { recursive: true });
    fs.writeFileSync(path.join(testProjectPath, 'pages', 'LoginPage.js'), '');

    context.outputPath = path.join(os.tmpdir(), 'type-output');
    const result = await agent.execute(context);

    const fixtureFile = result.analysis.files.find((f: any) => f.name === 'test.fixture.js');
    const testFile = result.analysis.files.find((f: any) => f.name === 'login.spec.js');
    const pageFile = result.analysis.files.find((f: any) => f.name === 'LoginPage.js');

    expect(fixtureFile?.type).toBe('fixture');
    expect(testFile?.type).toBe('test');
    expect(pageFile?.type).toBe('page-object');
  });

  test('should skip node_modules directory', async () => {
    fs.mkdirSync(testProjectPath, { recursive: true });
    fs.writeFileSync(path.join(testProjectPath, 'package.json'), '{}');
    fs.mkdirSync(path.join(testProjectPath, 'node_modules', 'pkg'), { recursive: true });
    fs.writeFileSync(path.join(testProjectPath, 'node_modules', 'pkg', 'index.js'), '');

    context.outputPath = path.join(os.tmpdir(), 'skip-output');
    const result = await agent.execute(context);

    const nodeModulesFiles = result.analysis.files.filter((f: any) => f.path.includes('node_modules'));
    expect(nodeModulesFiles.length).toBe(0);
  });

  test('should handle missing project path', async () => {
    context.projectPath = '/nonexistent/path';
    await expect(agent.execute(context)).rejects.toThrow();
  });
});
