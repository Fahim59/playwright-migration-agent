/**
 * Validators Utility
 * Provides validation helper functions
 */

import { Logger } from '@core/logger';
import * as fs from 'fs';

export class Validators {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Validate TypeScript code
   */
  validateTypeScript(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for common TypeScript issues
    if (/:\s*any\b/.test(code)) {
      errors.push('Found implicit any types - use unknown instead');
    }

    if (/const\s+\w+\s*=\s*(?!\w+\()/m.test(code) && !/:/.test(code)) {
      errors.push('Variable lacks type annotation');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate project structure
   */
  validateProjectStructure(projectPath: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for required files
    const requiredFiles = ['package.json', 'tsconfig.json', 'playwright.config.ts'];
    for (const file of requiredFiles) {
      const filePath = `${projectPath}/${file}`;
      if (!fs.existsSync(filePath)) {
        issues.push(`Missing required file: ${file}`);
      }
    }

    // Check for required folders
    const requiredFolders = ['src', 'tests'];
    for (const folder of requiredFolders) {
      const folderPath = `${projectPath}/${folder}`;
      if (!fs.existsSync(folderPath)) {
        issues.push(`Missing required folder: ${folder}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Validate file paths
   */
  validateFilePaths(paths: string[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    for (const filePath of paths) {
      if (!fs.existsSync(filePath)) {
        issues.push(`File not found: ${filePath}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
