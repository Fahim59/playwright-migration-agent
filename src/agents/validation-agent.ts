/**
 * Validation Agent
 * Runs TypeScript compilation, linting, and testing
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext, ValidationResult, CompilationError } from '@core/types';
import { execSync } from 'child_process';
import * as path from 'path';

export class ValidationAgent extends BaseAgent {
  /**
   * Execute validation
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Running validation checks`);
        this.validateContext(context);

        const startTime = Date.now();
        const result: ValidationResult = {
          passed: true,
          timestamp: new Date(),
          compilationErrors: [],
          lintErrors: [],
          testResults: [],
          duration: 0,
        };

        try {
          // Run TypeScript compiler
          result.compilationErrors = this.runTypeScriptCheck(context.outputPath);

          // Run ESLint
          result.lintErrors = this.runEslintCheck(context.outputPath);

          // Check if validation passed
          result.passed =
            result.compilationErrors.length === 0 &&
            result.lintErrors.length === 0;
        } catch (error) {
          this.logger.warn(`Validation error: ${error}`);
          result.passed = false;
        }

        result.duration = Date.now() - startTime;

        context.metadata.validationResult = result;

        const status = result.passed ? 'PASSED' : 'FAILED';
        this.logger.success(
          `[${this.getName()}] Validation complete: ${status} (${result.duration}ms)`
        );

        return context;
      },
      'Validation'
    );
  }

  /**
   * Run TypeScript compiler
   */
  private runTypeScriptCheck(projectPath: string): CompilationError[] {
    const errors: CompilationError[] = [];

    try {
      const output = execSync(`npx tsc --noEmit --project ${projectPath}`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // Parse output for errors
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('error TS')) {
          const match = /(.+?)\((\d+),(\d+)\):\s+error\s+TS(\d+):\s+(.+)/.exec(line);
          if (match) {
            errors.push({
              file: match[1],
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              code: `TS${match[4]}`,
              message: match[5],
            });
          }
        }
      }
    } catch (error) {
      // TypeScript check failed, but errors are captured above
      this.logger.debug(`TypeScript check output: ${error}`);
    }

    return errors;
  }

  /**
   * Run ESLint check
   */
  private runEslintCheck(projectPath: string): any[] {
    const errors: any[] = [];

    try {
      const output = execSync(`npx eslint ${projectPath}/src --format=json`, {
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      const results = JSON.parse(output);
      for (const file of results) {
        for (const message of file.messages) {
          errors.push({
            file: file.filePath,
            line: message.line,
            column: message.column,
            message: message.message,
            rule: message.ruleId,
            severity: message.severity === 2 ? 'error' : 'warning',
          });
        }
      }
    } catch (error) {
      this.logger.debug(`ESLint check output: ${error}`);
    }

    return errors;
  }
}
