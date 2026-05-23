/**
 * Configuration Loader
 * Loads and validates migration configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';
import { MigrationConfig } from './types';

export class ConfigLoader {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Load configuration from environment or file
   */
  loadConfig(
    sourceProjectPath: string,
    outputPath: string,
    referenceProjectPath?: string
  ): MigrationConfig {
    // Validate paths
    if (!fs.existsSync(sourceProjectPath)) {
      throw new Error(`Source project path does not exist: ${sourceProjectPath}`);
    }

    // Create output directory if needed
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const config: MigrationConfig = {
      sourceProjectPath: path.resolve(sourceProjectPath),
      outputPath: path.resolve(outputPath),
      referenceProjectPath: referenceProjectPath ? path.resolve(referenceProjectPath) : undefined,
      validateAfterConversion: process.env.VALIDATE_AFTER !== 'false',
      enableAutoFix: process.env.ENABLE_AUTO_FIX !== 'false',
      enableSelfHealing: process.env.ENABLE_SELF_HEALING !== 'false',
      maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
      agentTimeout: parseInt(process.env.AGENT_TIMEOUT || '300000'),
      verbose: process.env.VERBOSE === 'true',
      dryRun: process.env.DRY_RUN === 'true',
    };

    this.logger.info('Configuration loaded:', config);
    return config;
  }
}
