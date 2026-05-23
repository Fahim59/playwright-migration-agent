/**
 * Playwright Optimization Agent
 * Applies Playwright best practices and optimizations
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext } from '@core/types';
import { FileSystem } from '@utils/file-system';

export class PlaywrightOptimizationAgent extends BaseAgent {
  private fileSystem: FileSystem;

  constructor() {
    super();
    this.fileSystem = new FileSystem();
  }

  /**
   * Execute optimization
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Applying Playwright optimizations`);
        this.validateContext(context);

        if (!context.conversions || context.conversions.size === 0) {
          return context;
        }

        for (const [filePath, result] of context.conversions) {
          if (result.status === 'success' || result.status === 'partial') {
            try {
              const outputPath = `${context.outputPath}/${result.outputFile}`;
              let code = this.fileSystem.readFile(outputPath);

              // Apply optimizations
              code = this.optimizePlaywrightCode(code);
              code = this.addErrorHandling(code);
              code = this.optimizeSelectors(code);
              code = this.addWaitStrategies(code);

              this.fileSystem.writeFile(outputPath, code);
            } catch (error) {
              this.logger.warn(`Failed to optimize ${filePath}: ${error}`);
            }
          }
        }

        this.logger.success(`[${this.getName()}] Playwright optimization complete`);
        return context;
      },
      'Playwright optimization'
    );
  }

  /**
   * Optimize Playwright-specific code
   */
  private optimizePlaywrightCode(code: string): string {
    // Convert old waitForSelector to locator + waitFor
    code = code.replace(
      /await\s+page\.waitForSelector\s*\((['"](.*?)['"])\);?/gm,
      "await page.locator($1).waitFor();"
    );

    // Add type annotations to page methods
    code = code.replace(
      /page\.goto\s*\(([^)]+)\)/gm,
      'await page.goto($1)'
    );

    // Prefer semantic locators
    code = this.suggestSemanticLocators(code);

    return code;
  }

  /**
   * Add error handling
   */
  private addErrorHandling(code: string): string {
    // Add try-catch around navigation
    code = code.replace(
      /(await page\.goto\s*\([^)]+\)\s*;)/gm,
      'try { $1 } catch (error) { console.error("Navigation failed:", error); throw error; }'
    );

    // Add timeout handling
    code = code.replace(
      /(await.*?\.waitFor\s*\()/gm,
      '$1 { timeout: 30000 }'
    );

    return code;
  }

  /**
   * Optimize locators
   */
  private optimizeSelectors(code: string): string {
    // Replace XPath with semantic locators where possible
    code = code.replace(
      /page\.locator\s*\(\s*['"](\/\/[^'"]+)['"]\s*\)/g,
      'page.getByText("$1")'
    );

    // Replace CSS selectors with semantic where applicable
    code = code.replace(
      /page\.locator\s*\(\s*['"]\[data-testid=['"]([^'"]+)['"]\]['"]\s*\)/g,
      'page.getByTestId("$1")'
    );

    return code;
  }

  /**
   * Add wait strategies
   */
  private addWaitStrategies(code: string): string {
    // Add waitForLoadState after navigation
    code = code.replace(
      /(await page\.goto\s*\([^)]+\);?)/gm,
      '$1\n    await page.waitForLoadState("networkidle");'
    );

    return code;
  }

  /**
   * Suggest semantic locators
   */
  private suggestSemanticLocators(code: string): string {
    // This is a simplified version; a full implementation would use AST
    if (code.includes('role=')) {
      this.logger.debug('Semantic locators (getByRole) detected');
    }
    return code;
  }
}
