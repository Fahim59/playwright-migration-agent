/**
 * Pattern Detector Utility
 * Advanced pattern detection using regex and heuristics
 */

import { Logger } from '@core/logger';

interface PatternMatch {
  pattern: string;
  matches: Array<{ text: string; line: number }>;
  confidence: number;
}

export class PatternDetector {
  private logger: Logger;

  private patterns = {
    // Fixture patterns
    playwriteFixture: /test\.extend\s*<([^>]*)>\s*\(([^)]+)\)/gm,
    customFixture: /export\s+(?:const|let)\s+(\w+)\s*=\s*test\.extend/gm,

    // Class patterns
    classDeclaration: /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/gm,
    staticMethod: /static\s+(\w+)\s*\([^)]*\)\s*{/gm,

    // Playwright patterns
    pageGoto: /page\.goto\s*\(/gm,
    pageClick: /page\.click\s*\(|\w+\.click\s*\(/gm,
    pageLocator: /page\.locator\s*\(|this\.page\.locator/gm,
    semanticLocator: /page\.getByRole|page\.getByText|page\.getByLabel/gm,
    pageWait: /page\.waitFor|page\.waitForSelector/gm,

    // Assertion patterns
    expect: /expect\s*\([^)]+\)\.to[A-Za-z]+/gm,
    assert: /assert\s*\(|assertTrue|assertEqual/gm,

    // Hook patterns
    beforeHook: /beforeEach|beforeAll|setUp|setup/gm,
    afterHook: /afterEach|afterAll|tearDown|teardown/gm,

    // Data generation
    faker: /faker\.[a-z]+\(|new\s+Faker\(|@faker-js/gm,
    testData: /const\s+\w*[Dd]ata\s*=|testData\s*[=:]/gm,

    // Async patterns
    asyncFunction: /async\s+(?:function\s+)?(\w+)|const\s+(\w+)\s*=\s*async/gm,
    await: /await\s+/gm,

    // Import patterns
    esImport: /import\s+.*from\s+['"]([^'"]+)['"];?/gm,
    commonRequire: /const\s+\w+\s*=\s*require\s*\(['"]([^'"]+)['"]\);?/gm,

    // Error handling
    tryBlock: /try\s*{/gm,
    catchBlock: /catch\s*\([^)]*\)\s*{/gm,
    throwStatement: /throw\s+(?:new\s+)?\w+/gm,

    // Environment config
    envVariable: /process\.env\.[A-Z_]+|process\.env\[['"][^'"]+['"]\]/gm,
    dotenv: /require\s*\(['"]dotenv['"]\)|import\s+.*dotenv/gm,
  };

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Detect all patterns in code
   */
  detectAllPatterns(code: string): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const lines = code.split('\n');

    for (const [patternName, regex] of Object.entries(this.patterns)) {
      const patternMatches = this.findMatches(code, regex, lines);
      if (patternMatches.length > 0) {
        matches.push({
          pattern: patternName,
          matches: patternMatches,
          confidence: this.calculateConfidence(patternName, patternMatches.length),
        });
      }
    }

    return matches;
  }

  /**
   * Find all matches for a pattern
   */
  private findMatches(
    code: string,
    regex: RegExp,
    lines: string[]
  ): Array<{ text: string; line: number }> {
    const matches: Array<{ text: string; line: number }> = [];
    let match;

    // Reset regex lastIndex
    const regexCopy = new RegExp(regex.source, regex.flags);

    while ((match = regexCopy.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      matches.push({
        text: match[0],
        line: lineNum,
      });
    }

    return matches;
  }

  /**
   * Calculate confidence for pattern
   */
  private calculateConfidence(patternName: string, matchCount: number): number {
    // Base confidence by pattern type
    const baseConfidence: Record<string, number> = {
      playwriteFixture: 0.95,
      customFixture: 0.9,
      classDeclaration: 0.85,
      pageGoto: 0.9,
      expect: 0.95,
      faker: 0.9,
      asyncFunction: 0.85,
      esImport: 0.9,
    };

    const base = baseConfidence[patternName] || 0.7;

    // Adjust by frequency
    const frequency = Math.min(matchCount / 10, 1);
    return Math.min(base + frequency * 0.05, 0.99);
  }

  /**
   * Detect project type based on patterns
   */
  detectProjectType(
    code: string
  ): 'fixture-based' | 'class-based' | 'pom-based' | 'mixed' | 'unknown' {
    const patterns = this.detectAllPatterns(code);
    const patternNames = patterns.map((p) => p.pattern);

    const fixtureScore = patternNames.filter((p) => p.includes('Fixture')).length;
    const classScore = patternNames.filter((p) => p.includes('classDeclaration')).length;
    const playwrightScore = patternNames.filter((p) => p.includes('page')).length;

    if (fixtureScore > 0 && classScore === 0) return 'fixture-based';
    if (classScore > 0 && playwrightScore > 0) return 'pom-based';
    if (classScore > 0) return 'class-based';
    if (fixtureScore > 0 || playwrightScore > 0) return 'mixed';
    return 'unknown';
  }

  /**
   * Extract pattern statistics
   */
  getPatternStats(code: string): Record<string, number> {
    const patterns = this.detectAllPatterns(code);
    const stats: Record<string, number> = {};

    for (const pattern of patterns) {
      stats[pattern.pattern] = pattern.matches.length;
    }

    return stats;
  }
}
