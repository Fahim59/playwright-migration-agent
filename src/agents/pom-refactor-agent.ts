/**
 * POM Refactor Agent
 * Refactors page objects to match reference style
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext } from '@core/types';
import { FileSystem } from '@utils/file-system';

export class PomRefactorAgent extends BaseAgent {
  private fileSystem: FileSystem;

  constructor() {
    super();
    this.fileSystem = new FileSystem();
  }

  /**
   * Execute POM refactoring
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Refactoring page objects`);
        this.validateContext(context);

        if (!context.conversions || context.conversions.size === 0) {
          return context;
        }

        for (const [filePath, result] of context.conversions) {
          if (result.status === 'success' && filePath.includes('pages/')) {
            try {
              const outputPath = `${context.outputPath}/${result.outputFile}`;
              let code = this.fileSystem.readFile(outputPath);

              // Apply POM refactoring
              code = this.refactorPageObject(code);
              code = this.organizeMethodsByType(code);
              code = this.addDocumentation(code);
              code = this.standardizeNaming(code);

              this.fileSystem.writeFile(outputPath, code);
            } catch (error) {
              this.logger.warn(`Failed to refactor ${filePath}: ${error}`);
            }
          }
        }

        this.logger.success(`[${this.getName()}] POM refactoring complete`);
        return context;
      },
      'POM refactoring'
    );
  }

  /**
   * Refactor page object structure
   */
  private refactorPageObject(code: string): string {
    // Ensure proper class structure
    if (!code.includes('export class')) {
      code = code.replace(/^class\s+/m, 'export class ');
    }

    // Ensure constructor is properly formatted
    code = code.replace(
      /constructor\s*\(\s*page:\s*Page\s*\)\s*\{/,
      'constructor(page: Page) {'
    );

    // Add proper inheritance
    if (code.includes('extends')) {
      const classMatch = code.match(/export\s+class\s+(\w+)\s+extends\s+(\w+)/);
      if (classMatch && classMatch[2] !== 'BasePage') {
        code = code.replace(
          new RegExp(`extends ${classMatch[2]}`),
          'extends BasePage'
        );
      }
    }

    return code;
  }

  /**
   * Organize methods by type
   */
  private organizeMethodsByType(code: string): string {
    // This would require full AST parsing for production
    // For now, we add comments to mark sections

    if (code.includes('click') || code.includes('fill')) {
      code = code.replace(
        /(\s+)(?:async\s+)?\w+\s*\(.*click.*\)/,
        '\n  // Action Methods\n$&'
      );
    }

    if (code.includes('expect') || code.includes('assert')) {
      code = code.replace(
        /(\s+)(?:async\s+)?\w+\s*\(.*(?:expect|assert).*\)/,
        '\n  // Assertion Methods\n$&'
      );
    }

    return code;
  }

  /**
   * Add documentation
   */
  private addDocumentation(code: string): string {
    // Add class documentation
    if (!code.includes('/**') && code.includes('export class')) {
      const classMatch = code.match(/export\s+class\s+(\w+)/);
      if (classMatch) {
        const classDoc = `/**\n * ${classMatch[1]}\n * Page object for ${classMatch[1].replace(/([A-Z])/g, ' $1').toLowerCase()}\n */\n`;
        code = code.replace(/export\s+class/, classDoc + 'export class');
      }
    }

    return code;
  }

  /**
   * Standardize naming conventions
   */
  private standardizeNaming(code: string): string {
    // Convert method names to camelCase
    code = code.replace(/(async\s+)?(\w+)\s*\(/gm, (match, async, name) => {
      const camelCase = name.replace(/_([a-z])/g, (m, c) => c.toUpperCase());
      return (async || '') + camelCase + '(';
    });

    // Ensure private methods have underscore prefix
    code = code.replace(
      /^\s+(private\s+)?_(\w+)\s*\(/gm,
      '  private _$2('
    );

    return code;
  }
}
