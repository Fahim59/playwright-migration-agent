/**
 * Pattern Recognition Engine Tests
 */

import { PatternRecognitionEngine } from '../../agents/pattern-recognition-engine';
import { AgentContext } from '../../core/types';

describe('PatternRecognitionEngine', () => {
  let engine: PatternRecognitionEngine;
  let context: AgentContext;

  beforeEach(() => {
    engine = new PatternRecognitionEngine();
    context = {
      projectPath: '/test/project',
      outputPath: '/test/output',
      analysis: {
        rootPath: '/test/project',
        files: [
          {
            path: 'src/fixtures.ts',
            name: 'fixtures.ts',
            extension: '.ts',
            size: 500,
            content: `
              import { test as base } from '@playwright/test';
              
              type TestFixtures = {
                page: Page;
              };
              
              export const test = base.extend<TestFixtures>({
                page: async ({ page }, use) => {
                  await use(page);
                },
              });
            `,
            type: 'fixture',
          },
          {
            path: 'src/pages/LoginPage.ts',
            name: 'LoginPage.ts',
            extension: '.ts',
            size: 800,
            content: `
              export class LoginPage {
                constructor(private page: Page) {}
                
                async clickLogin() {
                  await this.page.click('[data-testid="login"]');
                }
                
                async expectSuccessMessage() {
                  await expect(this.page.locator('.success')).toBeVisible();
                }
              }
            `,
            type: 'page-object',
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

  test('should initialize engine', () => {
    expect(engine.getName()).toBe('PatternRecognitionEngine');
  });

  test('should recognize fixture patterns', async () => {
    const result = await engine.execute(context);
    expect(result.metadata.detectedPatterns).toBeDefined();
    const fixturePattern = result.metadata.detectedPatterns.find(
      (p: any) => p.name.includes('Fixture')
    );
    expect(fixturePattern).toBeDefined();
  });

  test('should recognize class patterns', async () => {
    const result = await engine.execute(context);
    const classPattern = result.metadata.detectedPatterns.find((p: any) => p.name.includes('Class'));
    expect(classPattern).toBeDefined();
  });

  test('should recognize Playwright methods', async () => {
    const result = await engine.execute(context);
    const playwrightPattern = result.metadata.detectedPatterns.find(
      (p: any) => p.name.includes('Playwright')
    );
    expect(playwrightPattern).toBeDefined();
  });

  test('should recognize assertion patterns', async () => {
    const result = await engine.execute(context);
    const assertionPattern = result.metadata.detectedPatterns.find((p: any) => p.name.includes('Assertion'));
    expect(assertionPattern).toBeDefined();
  });
});
