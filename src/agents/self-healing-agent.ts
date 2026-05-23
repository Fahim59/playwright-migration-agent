/**
 * Self-Healing Agent
 * Analyzes errors and applies automatic fixes
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext } from '@core/types';
import { FileSystem } from '@utils/file-system';
import { ErrorParser } from '@utils/error-parser';

export class SelfHealingAgent extends BaseAgent {
  private fileSystem: FileSystem;
  private errorParser: ErrorParser;

  constructor() {
    super();
    this.fileSystem = new FileSystem();
    this.errorParser = new ErrorParser();
  }

  /**
   * Execute self-healing
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Analyzing errors for healing`);
        this.validateContext(context);

        const validationResult = context.metadata.validationResult as any;
        if (!validationResult || (!validationResult.compilationErrors && !validationResult.lintErrors)) {
          this.logger.info('[${this.getName()}] No errors to heal');
          return context;
        }

        // Categorize errors
        const allErrors = [
          ...(validationResult.compilationErrors || []),
          ...(validationResult.lintErrors || []),
        ];

        const categories = this.errorParser.categorizeErrors(allErrors);

        // Apply fixes by category
        for (const [category, errors] of Object.entries(categories)) {
          if ((errors as any[]).length > 0) {
            await this.applyFixes(category, errors as any[], context);
          }
        }

        this.logger.success(`[${this.getName()}] Self-healing complete`);
        return context;
      },
      'Self-healing'
    );
  }

  /**
   * Apply fixes for error category
   */
  private async applyFixes(category: string, errors: any[], context: AgentContext): Promise<void> {
    switch (category) {
      case 'typeErrors':
        await this.fixTypeErrors(errors, context);
        break;
      case 'importErrors':
        await this.fixImportErrors(errors, context);
        break;
      case 'syntaxErrors':
        await this.fixSyntaxErrors(errors, context);
        break;
      case 'lintErrors':
        await this.fixLintErrors(errors, context);
        break;
    }
  }

  /**
   * Fix type errors
   */
  private async fixTypeErrors(errors: any[], context: AgentContext): Promise<void> {
    this.logger.info(`Fixing ${errors.length} type errors`);

    for (const error of errors) {
      try {
        const filePath = `${context.outputPath}/${error.file}`;
        let code = this.fileSystem.readFile(filePath);

        // Common type fixes
        if (error.code === 'TS7030') {
          // Add type annotation for implicit any
          code = code.replace(/(const|let)\s+(\w+)\s*=/g, '$1 $2: unknown =');
        }

        if (error.code === 'TS2339') {
          // Property doesn't exist
          code = code.replace(
            new RegExp(`\\b${error.message.match(/\w+(?=\.)/)}`),
            ''
          );
        }

        this.fileSystem.writeFile(filePath, code);
      } catch (error) {
        this.logger.warn(`Failed to fix type error: ${error}`);
      }
    }
  }

  /**
   * Fix import errors
   */
  private async fixImportErrors(errors: any[], context: AgentContext): Promise<void> {
    this.logger.info(`Fixing ${errors.length} import errors`);

    for (const error of errors) {
      try {
        const filePath = `${context.outputPath}/${error.file}`;
        let code = this.fileSystem.readFile(filePath);

        // Common import fixes
        // Add missing .ts extension
        code = code.replace(
          /from\s+['"](\.\/.+?)(?<!.ts)['"];?/g,
          "from '$1.ts';"
        );

        // Remove duplicate imports
        const importLines = code.split('\n').filter((line) => line.includes('import'));
        const uniqueImports = [...new Set(importLines)];
        const nonImportLines = code.split('\n').filter((line) => !line.includes('import'));

        code = [...uniqueImports, ...nonImportLines].join('\n');

        this.fileSystem.writeFile(filePath, code);
      } catch (error) {
        this.logger.warn(`Failed to fix import error: ${error}`);
      }
    }
  }

  /**
   * Fix syntax errors
   */
  private async fixSyntaxErrors(errors: any[], context: AgentContext): Promise<void> {
    this.logger.info(`Fixing ${errors.length} syntax errors`);

    for (const error of errors) {
      try {
        const filePath = `${context.outputPath}/${error.file}`;
        let code = this.fileSystem.readFile(filePath);

        // Add missing semicolons
        code = code.replace(/([^;{\n])\n/g, '$1;\n');

        // Fix missing braces
        code = code.replace(/if\s*\([^)]+\)\s+([^{])/g, 'if ($1) { $2 }');

        this.fileSystem.writeFile(filePath, code);
      } catch (error) {
        this.logger.warn(`Failed to fix syntax error: ${error}`);
      }
    }
  }

  /**
   * Fix lint errors
   */
  private async fixLintErrors(errors: any[], context: AgentContext): Promise<void> {
    this.logger.info(`Fixing ${errors.length} lint errors`);

    for (const error of errors) {
      try {
        const filePath = `${context.outputPath}/${error.file}`;
        let code = this.fileSystem.readFile(filePath);

        // Common lint fixes
        if (error.rule === 'no-unused-vars') {
          // Prefix with underscore
          code = code.replace(/(const|let)\s+(\w+)(?=\s*:)/g, '$1 _$2');
        }

        if (error.rule === 'no-explicit-any') {
          // Replace any with unknown
          code = code.replace(/:\s*any\b/g, ': unknown');
        }

        this.fileSystem.writeFile(filePath, code);
      } catch (error) {
        this.logger.warn(`Failed to fix lint error: ${error}`);
      }
    }
  }
}
