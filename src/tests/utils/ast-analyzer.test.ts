/**
 * AST Analyzer Tests
 */

import { AstAnalyzer } from '../../utils/ast-analyzer';

describe('AstAnalyzer', () => {
  let analyzer: AstAnalyzer;

  beforeEach(() => {
    analyzer = new AstAnalyzer();
  });

  test('should parse TypeScript code', () => {
    const code = `
      export class LoginPage {
        async login() {
          console.log('logging in');
        }
      }
    `;

    const sourceFile = analyzer.parseCode(code, 'test.ts');
    expect(sourceFile).toBeDefined();
  });

  test('should extract classes', () => {
    const code = `
      class User {}
      class Admin {}
    `;

    const sourceFile = analyzer.parseCode(code, 'test.ts');
    const classes = analyzer.extractClasses(sourceFile);
    expect(classes.length).toBe(2);
    expect(classes).toContain('User');
    expect(classes).toContain('Admin');
  });

  test('should extract functions', () => {
    const code = `
      function helper() {}
      const arrow = () => {};
    `;

    const sourceFile = analyzer.parseCode(code, 'test.ts');
    const functions = analyzer.extractFunctions(sourceFile);
    expect(functions.length).toBeGreaterThan(0);
  });

  test('should extract imports', () => {
    const code = `
      import { Page } from '@playwright/test';
      import { LoginPage } from './pages/LoginPage';
    `;

    const sourceFile = analyzer.parseCode(code, 'test.ts');
    const imports = analyzer.extractImports(sourceFile);
    expect(imports.length).toBe(2);
  });

  test('should check for async/await', () => {
    const code = `
      async function test() {
        await page.goto('/');
      }
    `;

    const sourceFile = analyzer.parseCode(code, 'test.ts');
    const hasAsync = analyzer.hasAsyncAwait(sourceFile);
    expect(hasAsync).toBe(true);
  });
});
