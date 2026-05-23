/**
 * Pattern Recognition Engine
 * Uses AST analysis to identify specific code patterns
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext, FileInfo, DetectedPattern } from '@core/types';
import { COMMON_PATTERNS } from '@core/constants';

export class PatternRecognitionEngine extends BaseAgent {
  /**
   * Execute pattern recognition
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Recognizing code patterns`);
        this.validateContext(context);

        if (!context.analysis) {
          throw new Error('Project structure not analyzed. Run ProjectScannerAgent first.');
        }

        const patterns = this.recognizePatterns(context.analysis.files);

        // Store patterns in metadata
        context.metadata.detectedPatterns = patterns;

        this.logger.success(
          `[${this.getName()}] Pattern recognition complete: ${patterns.length} patterns found`
        );

        return context;
      },
      'Pattern recognition'
    );
  }

  /**
   * Recognize patterns in files
   */
  private recognizePatterns(files: FileInfo[]): DetectedPattern[] {
    const allPatterns: DetectedPattern[] = [];

    for (const file of files) {
      if (!file.content) continue;

      const patterns = this.analyzeFile(file);
      allPatterns.push(...patterns);
    }

    return allPatterns;
  }

  /**
   * Analyze individual file
   */
  private analyzeFile(file: FileInfo): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const content = file.content || '';
    const lines = content.split('\n');

    // Check for fixtures
    this.checkFixturePatterns(content, file, patterns);

    // Check for classes
    this.checkClassPatterns(content, file, patterns);

    // Check for functions
    this.checkFunctionPatterns(content, file, patterns);

    // Check for specific patterns
    this.checkSpecificPatterns(content, file, lines, patterns);

    return patterns;
  }

  /**
   * Check for fixture patterns
   */
  private checkFixturePatterns(content: string, file: FileInfo, patterns: DetectedPattern[]): void {
    // test.extend pattern
    const extendMatch = COMMON_PATTERNS.FIXTURE_PATTERN.exec(content);
    if (extendMatch) {
      patterns.push({
        name: `Fixture: ${extendMatch[1]}`,
        type: 'fixture',
        location: file.path,
        description: `Fixture defined using test.extend`,
        confidence: 0.95,
      });
    }

    // export fixture pattern
    if (/export\s+const\s+\w+\s*=.*fixtures/m.test(content)) {
      patterns.push({
        name: 'Exported Fixtures',
        type: 'fixture',
        location: file.path,
        description: 'Custom fixtures exported from module',
        confidence: 0.85,
      });
    }
  }

  /**
   * Check for class patterns
   */
  private checkClassPatterns(content: string, file: FileInfo, patterns: DetectedPattern[]): void {
    const classMatches = Array.from(content.matchAll(COMMON_PATTERNS.CLASS_PATTERN));

    for (const match of classMatches) {
      const className = match[1];
      const extendsClass = match[2];

      patterns.push({
        name: `Class: ${className}`,
        type: 'page-object',
        location: file.path,
        description: extendsClass
          ? `Class extends ${extendsClass}`
          : 'Standalone class definition',
        confidence: 0.9,
      });
    }
  }

  /**
   * Check for function patterns
   */
  private checkFunctionPatterns(content: string, file: FileInfo, patterns: DetectedPattern[]): void {
    const functionMatches = Array.from(content.matchAll(COMMON_PATTERNS.ASYNC_FUNCTION));

    for (const match of functionMatches) {
      const funcName = match[1] || match[2];
      patterns.push({
        name: `Function: ${funcName}`,
        type: 'utility',
        location: file.path,
        description: 'Async function detected',
        confidence: 0.8,
      });
    }
  }

  /**
   * Check for specific code patterns
   */
  private checkSpecificPatterns(
    content: string,
    file: FileInfo,
    lines: string[],
    patterns: DetectedPattern[]
  ): void {
    // Playwright page methods
    if (/page\.(goto|click|fill|waitFor)/m.test(content)) {
      patterns.push({
        name: 'Playwright Page Methods',
        type: 'page-object',
        location: file.path,
        description: 'Uses Playwright page methods',
        confidence: 0.85,
      });
    }

    // Locator patterns
    if (/page\.locator|page\.getByRole|page\.getByText/m.test(content)) {
      patterns.push({
        name: 'Semantic Locators',
        type: 'page-object',
        location: file.path,
        description: 'Uses semantic locators',
        confidence: 0.9,
      });
    }

    // Assert patterns
    if (/expect\(/m.test(content)) {
      const assertCount = (content.match(/expect\(/g) || []).length;
      patterns.push({
        name: 'Assertions',
        type: 'test',
        location: file.path,
        description: `${assertCount} assertions found`,
        confidence: 0.95,
      });
    }

    // Hook patterns
    if (/beforeEach|afterEach|beforeAll|afterAll/m.test(content)) {
      patterns.push({
        name: 'Test Hooks',
        type: 'utility',
        location: file.path,
        description: 'Test lifecycle hooks detected',
        confidence: 0.9,
      });
    }

    // Static methods
    if (/static\s+\w+\s*\(/m.test(content)) {
      patterns.push({
        name: 'Static Methods',
        type: 'utility',
        location: file.path,
        description: 'Static methods detected',
        confidence: 0.85,
      });
    }

    // Faker usage
    if (/faker\.|@faker-js/m.test(content)) {
      const fakerCount = (content.match(/faker\./g) || []).length;
      patterns.push({
        name: 'Faker Data Generation',
        type: 'utility',
        location: file.path,
        description: `${fakerCount} faker calls detected`,
        confidence: 0.9,
      });
    }

    // Environment configuration
    if (/process\.env|dotenv|config\(/m.test(content)) {
      patterns.push({
        name: 'Environment Configuration',
        type: 'utility',
        location: file.path,
        description: 'Environment configuration detected',
        confidence: 0.85,
      });
    }

    // Error handling
    if (/try\s*\{|catch\s*\(|throw\s+/m.test(content)) {
      const errorHandlingCount = (content.match(/catch\s*\(/g) || []).length;
      patterns.push({
        name: 'Error Handling',
        type: 'utility',
        location: file.path,
        description: `${errorHandlingCount} error handlers detected`,
        confidence: 0.8,
      });
    }
  }
}
