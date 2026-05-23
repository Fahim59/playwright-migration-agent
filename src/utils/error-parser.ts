/**
 * Error Parser Utility
 * Parses compilation and validation errors
 */

import { Logger } from '@core/logger';
import { CompilationError, LintError } from '@core/types';

export class ErrorParser {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Parse TypeScript compilation errors
   */
  parseCompilationErrors(errorOutput: string): CompilationError[] {
    const errors: CompilationError[] = [];

    // Pattern: file.ts(line,col): error TS####: message
    const pattern = /^(.+?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)$/gm;
    let match;

    while ((match = pattern.exec(errorOutput)) !== null) {
      errors.push({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: `TS${match[4]}`,
        message: match[5],
      });
    }

    return errors;
  }

  /**
   * Parse ESLint errors
   */
  parseLintErrors(errorOutput: string): LintError[] {
    const errors: LintError[] = [];

    // Pattern: file.ts:line:col rule message
    const lines = errorOutput.split('\n');
    for (const line of lines) {
      if (!line.includes(':')) continue;

      const match = /^(.+?):(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+\(([^)]+)\)/.exec(line);
      if (match) {
        errors.push({
          file: match[1],
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          severity: match[4] as 'error' | 'warning',
          message: match[5],
          rule: match[6],
        });
      }
    }

    return errors;
  }

  /**
   * Categorize errors by type
   */
  categorizeErrors(
    errors: (CompilationError | LintError)[]
  ): Record<string, (CompilationError | LintError)[]> {
    const categories: Record<string, (CompilationError | LintError)[]> = {
      typeErrors: [],
      importErrors: [],
      syntaxErrors: [],
      lintErrors: [],
      other: [],
    };

    for (const error of errors) {
      if ('code' in error) {
        // Compilation error
        if (error.code.includes('TS2')) {
          categories.typeErrors.push(error);
        } else if (error.code.includes('TS6')) {
          categories.importErrors.push(error);
        } else if (error.code.includes('TS10')) {
          categories.syntaxErrors.push(error);
        } else {
          categories.other.push(error);
        }
      } else if ('rule' in error) {
        // Lint error
        categories.lintErrors.push(error);
      }
    }

    return categories;
  }

  /**
   * Suggest fixes for common errors
   */
  suggestFix(error: CompilationError | LintError): string | null {
    if ('code' in error) {
      // Compilation error
      if (error.code === 'TS2339') {
        return `Add missing property definition: ${error.message}`;
      }
      if (error.code === 'TS7030') {
        return 'Use explicit type annotation for variable';
      }
      if (error.code === 'TS6133') {
        return `Remove unused variable or add leading underscore: _${error.message}`;
      }
    } else if ('rule' in error) {
      // Lint error
      if (error.rule === 'no-explicit-any') {
        return 'Replace `any` with specific type or `unknown`';
      }
      if (error.rule === 'no-unused-vars') {
        return 'Remove unused variable or prefix with underscore';
      }
    }

    return null;
  }

  /**
   * Group errors by file
   */
  groupErrorsByFile(
    errors: (CompilationError | LintError)[]
  ): Record<string, (CompilationError | LintError)[]> {
    const grouped: Record<string, (CompilationError | LintError)[]> = {};

    for (const error of errors) {
      const file = error.file;
      if (!grouped[file]) {
        grouped[file] = [];
      }
      grouped[file].push(error);
    }

    return grouped;
  }

  /**
   * Get error summary
   */
  getSummary(errors: (CompilationError | LintError)[]): Record<string, number> {
    return {
      total: errors.length,
      errors: errors.filter((e) => 'severity' in e ? e.severity === 'error' : true).length,
      warnings: errors.filter((e) => 'severity' in e && e.severity === 'warning').length,
      files: new Set(errors.map((e) => e.file)).size,
    };
  }
}
