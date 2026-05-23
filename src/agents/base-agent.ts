/**
 * Base Agent Class
 * All agents inherit from this class
 */

import { Logger } from '@core/logger';
import { AgentContext, AgentConfig } from '@core/types';

export abstract class BaseAgent {
  protected logger: Logger;
  protected config: AgentConfig;

  constructor(config: AgentConfig = {}) {
    this.logger = new Logger(process.env.LOG_LEVEL as any);
    this.config = {
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 300000,
      verbose: config.verbose || false,
      dryRun: config.dryRun || false,
    };
  }

  /**
   * Main execution method - must be implemented by subclasses
   */
  abstract execute(context: AgentContext): Promise<AgentContext>;

  /**
   * Retry logic with exponential backoff
   */
  protected async retry<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        this.logger.debug(`[${this.constructor.name}] Attempt ${attempt}/${this.config.maxRetries}: ${operationName}`);
        return await this.executeWithTimeout(fn);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `[${this.constructor.name}] Attempt ${attempt} failed: ${lastError.message}`
        );

        if (attempt < this.config.maxRetries) {
          const delay = 2000 * Math.pow(1.5, attempt - 1);
          this.logger.debug(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error(`${operationName} failed after ${this.config.maxRetries} attempts`);
  }

  /**
   * Execute function with timeout
   */
  protected executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timed out after ${this.config.timeout}ms`)),
          this.config.timeout
        )
      ),
    ]);
  }

  /**
   * Validate context
   */
  protected validateContext(context: AgentContext): void {
    if (!context.projectPath) {
      throw new Error('AgentContext missing projectPath');
    }
    if (!context.outputPath) {
      throw new Error('AgentContext missing outputPath');
    }
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.constructor.name;
  }
}
