/**
 * AST Transformation Agent
 * Applies advanced AST-based transformations using ts-morph
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext } from '@core/types';
import { AstAnalyzer } from '@utils/ast-analyzer';
import { FileSystem } from '@utils/file-system';

export class AstTransformationAgent extends BaseAgent {
  private astAnalyzer: AstAnalyzer;
  private fileSystem: FileSystem;

  constructor() {
    super();
    this.astAnalyzer = new AstAnalyzer();
    this.fileSystem = new FileSystem();
  }

  /**
   * Execute AST transformations
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Applying AST transformations`);
        this.validateContext(context);

        if (!context.conversions || context.conversions.size === 0) {
          this.logger.warn('[${this.getName()}] No converted files to transform');
          return context;
        }

        // Apply transformations to converted files
        for (const [filePath, result] of context.conversions) {
          if (result.status === 'success' || result.status === 'partial') {
            try {
              const outputPath = `${context.outputPath}/${result.outputFile}`;
              let code = this.fileSystem.readFile(outputPath);

              // Parse and transform
              const sourceFile = this.astAnalyzer.parseCode(code, result.outputFile);
              code = this.applyTransformations(sourceFile, code);

              // Write back
              this.fileSystem.writeFile(outputPath, code);
            } catch (error) {
              this.logger.warn(`Failed to transform ${filePath}: ${error}`);
            }
          }
        }

        this.logger.success(`[${this.getName()}] AST transformations complete`);
        return context;
      },
      'AST transformation'
    );
  }

  /**
   * Apply transformations to AST
   */
  private applyTransformations(sourceFile: any, code: string): string {
    // Extract metadata
    const classes = this.astAnalyzer.extractClasses(sourceFile);
    const functions = this.astAnalyzer.extractFunctions(sourceFile);

    // Format code
    code = this.formatCode(code);

    // Add missing semicolons
    code = this.addSemicolons(code);

    // Fix common patterns
    code = this.fixCommonPatterns(code, classes);

    return code;
  }

  /**
   * Format code
   */
  private formatCode(code: string): string {
    const lines = code.split('\n');
    let formatted = '';

    for (const line of lines) {
      // Skip empty lines
      if (line.trim() === '') {
        formatted += '\n';
        continue;
      }

      // Normalize indentation
      const trimmed = line.trimStart();
      const indent = line.length - trimmed.length;
      const normalizedIndent = Math.floor(indent / 2) * 2;

      formatted += ' '.repeat(normalizedIndent) + trimmed + '\n';
    }

    return formatted.trim();
  }

  /**
   * Add missing semicolons
   */
  private addSemicolons(code: string): string {
    const lines = code.split('\n');
    let result = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const trimmed = line.trimEnd();

      // Add semicolon if missing and not a block statement
      if (
        trimmed &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(',') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(':')
      ) {
        line = trimmed + ';';
      }

      result += line + '\n';
    }

    return result.trim();
  }

  /**
   * Fix common patterns
   */
  private fixCommonPatterns(code: string, classes: string[]): string {
    // Fix class method formatting
    for (const className of classes) {
      // Ensure constructor is typed
      code = code.replace(
        new RegExp(`(class ${className}[^{]*{[^}]*?)constructor\s*\(`, 'g'),
        '$1constructor('
      );
    }

    // Fix async function returns
    code = code.replace(/async\s+(\w+)\s*\(([^)]*)\)\s*(?!:)/gm, 'async $1($2): Promise<void>');

    // Fix arrow functions
    code = code.replace(/(\w+)\s*=>\s*{/g, '($1) => {');

    return code;
  }
}
