/**
 * JavaScript to TypeScript Conversion Agent
 * Converts JavaScript code to TypeScript syntax
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext, ConversionResult } from '@core/types';
import { FileSystem } from '@utils/file-system';
import { Logger } from '@core/logger';

export class JsToTsConversionAgent extends BaseAgent {
  private fileSystem: FileSystem;

  constructor() {
    super();
    this.fileSystem = new FileSystem();
  }

  /**
   * Execute conversion
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Converting JavaScript to TypeScript`);
        this.validateContext(context);

        if (!context.analysis) {
          throw new Error('Project structure not analyzed');
        }

        const conversions: Map<string, ConversionResult> = new Map();
        const jsFiles = context.analysis.files.filter(
          (f) => f.extension === '.js' || f.extension === '.jsx'
        );

        for (const file of jsFiles) {
          const result = this.convertFile(file, context);
          conversions.set(file.path, result);
        }

        context.conversions = conversions;

        const successCount = Array.from(conversions.values()).filter(
          (r) => r.status === 'success' || r.status === 'partial'
        ).length;

        this.logger.success(
          `[${this.getName()}] Conversion complete: ${successCount}/${jsFiles.length} files converted`
        );

        return context;
      },
      'JavaScript to TypeScript conversion'
    );
  }

  /**
   * Convert individual file
   */
  private convertFile(file: any, context: AgentContext): ConversionResult {
    const errors: any[] = [];
    const warnings: any[] = [];

    try {
      let code = file.content || '';

      // Step 1: Convert require to import
      code = this.convertRequireToImport(code);

      // Step 2: Remove module.exports
      code = this.convertExports(code);

      // Step 3: Add .ts extension to imports
      code = this.updateImportExtensions(code);

      // Step 4: Convert CommonJS to ES6 imports
      code = this.normalizeImports(code);

      // Step 5: Add basic type annotations
      code = this.addBasicTypes(code);

      // Step 6: Remove var, prefer const/let
      code = this.modernizeVariableDeclarations(code);

      // Write converted file
      const outputPath = file.path.replace(/\.js$/, '.ts');
      const fullOutputPath = `${context.outputPath}/${outputPath}`;

      this.fileSystem.writeFile(fullOutputPath, code);

      return {
        sourceFile: file.path,
        outputFile: outputPath,
        status: 'success',
        errors,
        warnings,
        metrics: {
          linesOfCode: code.split('\n').length,
          typeAnnotations: (code.match(/:\s*\w+/g) || []).length,
          imports: (code.match(/^import\s+/gm) || []).length,
          exports: (code.match(/^export\s+/gm) || []).length,
          complexity: this.calculateComplexity(code),
        },
      };
    } catch (error) {
      errors.push({
        code: 'CONVERSION_FAILED',
        message: error instanceof Error ? error.message : String(error),
        severity: 'error',
      });

      return {
        sourceFile: file.path,
        outputFile: file.path.replace(/\.js$/, '.ts'),
        status: 'failed',
        errors,
        warnings,
        metrics: {
          linesOfCode: 0,
          typeAnnotations: 0,
          imports: 0,
          exports: 0,
          complexity: 0,
        },
      };
    }
  }

  /**
   * Convert require() to import
   */
  private convertRequireToImport(code: string): string {
    // const x = require('module') -> import x from 'module'
    code = code.replace(
      /const\s+({?\s*\w+\s*}?)\s*=\s*require\s*\((['"])([^'"]+)\2\);?/gm,
      (match, vars, quote, module) => {
        const trimmed = vars.trim();
        if (trimmed.startsWith('{')) {
          return `import ${vars} from '${module}';`;
        }
        return `import ${vars} from '${module}';`;
      }
    );

    // require('module') for side effects
    code = code.replace(/require\s*\((['"])([^'"]+)\1\);?/gm, "import '$2';");

    return code;
  }

  /**
   * Convert module.exports to export
   */
  private convertExports(code: string): string {
    // module.exports = { ... } -> export { ... }
    code = code.replace(/module\.exports\s*=\s*{/, 'export {');

    // module.exports.x = y -> export const x = y
    code = code.replace(
      /module\.exports\.(\w+)\s*=\s*(.+);?/gm,
      'export const $1 = $2;'
    );

    return code;
  }

  /**
   * Update import extensions
   */
  private updateImportExtensions(code: string): string {
    // Add .ts extension to relative imports without extension
    code = code.replace(
      /import\s+(.+?)\s+from\s+['"](\.\/.+?)['"];?/gm,
      (match, imports, path) => {
        if (!path.includes('.')) {
          return `import ${imports} from '${path}.ts';`;
        }
        return match;
      }
    );

    return code;
  }

  /**
   * Normalize imports
   */
  private normalizeImports(code: string): string {
    // Replace .js extensions in imports with .ts
    code = code.replace(/from\s+['"]([^'"]+)\.js['"];?/gm, "from '$1.ts';");

    return code;
  }

  /**
   * Add basic type annotations
   */
  private addBasicTypes(code: string): string {
    // Add return type to functions
    code = code.replace(
      /async\s+(\w+)\s*\(([^)]*)\)\s*{/gm,
      'async $1($2): Promise<void> {'
    );

    return code;
  }

  /**
   * Modernize variable declarations
   */
  private modernizeVariableDeclarations(code: string): string {
    // var -> const (when not reassigned)
    // This is simplified; full analysis would require AST
    code = code.replace(/\bvar\s+/g, 'const ');

    return code;
  }

  /**
   * Calculate code complexity
   */
  private calculateComplexity(code: string): number {
    let complexity = 1;
    complexity += (code.match(/if\s*\(/g) || []).length;
    complexity += (code.match(/for\s*\(/g) || []).length;
    complexity += (code.match(/while\s*\(/g) || []).length;
    complexity += (code.match(/catch\s*\(/g) || []).length;
    return complexity;
  }
}
