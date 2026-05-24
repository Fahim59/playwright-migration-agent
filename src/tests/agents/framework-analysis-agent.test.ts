/**
 * Framework Analysis Agent Tests
 */

import { FrameworkAnalysisAgent } from '../../agents/framework-analysis-agent';
import { AgentContext } from '../../core/types';

describe('FrameworkAnalysisAgent', () => {
  let agent: FrameworkAnalysisAgent;
  let context: AgentContext;

  beforeEach(() => {
    agent = new FrameworkAnalysisAgent();
    context = {
      projectPath: '/test/project',
      outputPath: '/test/output',
      analysis: {
        rootPath: '/test/project',
        files: [
          {
            path: 'src/pages/LoginPage.ts',
            name: 'LoginPage.ts',
            extension: '.ts',
            size: 1000,
            content: `
              class LoginPage extends BasePage {
                async fillEmail(email: string) {
                  await this.page.fill('[data-testid="email"]', email);
                }
              }
            `,
            type: 'page-object',
          },
        ],
        folders: [
          { path: 'src/pages', name: 'pages', childCount: 2, fileCount: 2 },
          { path: 'src/fixtures', name: 'fixtures', childCount: 1, fileCount: 1 },
          { path: 'tests', name: 'tests', childCount: 5, fileCount: 5 },
        ],
        packageJson: {
          name: 'test-project',
          version: '1.0.0',
          dependencies: {},
          devDependencies: { '@playwright/test': '^1.40.0' },
          scripts: {},
        },
        playwrightConfig: {
          testDir: './tests',
          timeout: 300000,
          workers: 1,
          browsers: ['chromium'],
          reporters: ['list'],
        },
      } as any,
      conversions: new Map(),
      errors: [],
      metadata: {},
    };
  });

  test('should initialize agent', () => {
    expect(agent.getName()).toBe('FrameworkAnalysisAgent');
  });

  test('should analyze framework structure', async () => {
    const result = await agent.execute(context);

    expect(result.frameworkAnalysis).toBeDefined();
    expect(result.frameworkAnalysis.projectType).toBeDefined();
    expect(result.frameworkAnalysis.patterns).toBeDefined();
    expect(result.frameworkAnalysis.architecture).toBeDefined();
  });

  test('should detect project type', async () => {
    const result = await agent.execute(context);
    expect(['fixture-based', 'class-based', 'pom-based', 'mixed', 'unknown']).toContain(
      result.frameworkAnalysis.projectType
    );
  });

  test('should calculate confidence score', async () => {
    const result = await agent.execute(context);
    expect(result.frameworkAnalysis.confidence).toBeGreaterThan(0);
    expect(result.frameworkAnalysis.confidence).toBeLessThanOrEqual(1);
  });

  test('should detect class-based patterns', async () => {
    const result = await agent.execute(context);
    const hasClassPattern = result.frameworkAnalysis.patterns.some(
      (p: any) => p.name.includes('Class') || p.type === 'page-object'
    );
    expect(hasClassPattern).toBe(true);
  });

  test('should throw error when analysis not available', async () => {
    const invalidContext: AgentContext = {
      projectPath: '/test/project',
      outputPath: '/test/output',
      analysis: undefined as any,
      conversions: new Map(),
      errors: [],
      metadata: {},
    };

    await expect(agent.execute(invalidContext)).rejects.toThrow();
  });
});
