/**
 * Pattern Detector Tests
 */

import { PatternDetector } from '../../utils/pattern-detector';

describe('PatternDetector', () => {
  let detector: PatternDetector;

  beforeEach(() => {
    detector = new PatternDetector();
  });

  test('should detect fixture patterns', () => {
    const code = `
      export const test = base.extend({
        page: async ({ page }, use) => {
          await use(page);
        },
      });
    `;

    const patterns = detector.detectAllPatterns(code);
    expect(patterns.length).toBeGreaterThan(0);
  });

  test('should detect class patterns', () => {
    const code = `
      class LoginPage {
        constructor(private page: Page) {}
      }
    `;

    const patterns = detector.detectAllPatterns(code);
    const classPattern = patterns.find((p) => p.pattern.includes('class'));
    expect(classPattern).toBeDefined();
  });

  test('should detect async functions', () => {
    const code = `
      async function login() {
        await page.goto('/login');
      }
    `;

    const patterns = detector.detectAllPatterns(code);
    expect(patterns.length).toBeGreaterThan(0);
  });

  test('should calculate confidence scores', () => {
    const code = `
      async function test() {
        expect(true).toBe(true);
      }
    `;

    const patterns = detector.detectAllPatterns(code);
    for (const pattern of patterns) {
      expect(pattern.confidence).toBeGreaterThan(0);
      expect(pattern.confidence).toBeLessThanOrEqual(1);
    }
  });

  test('should detect project type', () => {
    const code = `
      export const test = base.extend({});
      class LoginPage {}
    `;

    const projectType = detector.detectProjectType(code);
    expect(['fixture-based', 'class-based', 'pom-based', 'mixed', 'unknown']).toContain(projectType);
  });
});
