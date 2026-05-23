/**
 * Reference Learner Agent
 * Analyzes reference TypeScript framework to extract conventions
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAgent } from './base-agent.ts';
import {
  AgentContext,
  ReferenceFrameworkAnalysis,
  ReferenceStructure,
  NamingConventions,
  CodeStyleGuide,
  AbstractionPattern,
} from '@core/types';

export class ReferenceLearnerAgent extends BaseAgent {
  /**
   * Execute reference learning
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        if (!context.referencePath) {
          this.logger.warn('[${this.getName()}] No reference framework provided, skipping');
          return context;
        }

        this.logger.info(`[${this.getName()}] Learning from reference framework: ${context.referencePath}`);

        const referenceAnalysis = await this.analyzeReference(context.referencePath);
        context.referenceAnalysis = referenceAnalysis;

        this.logger.success(
          `[${this.getName()}] Reference learning complete: ${referenceAnalysis.name} v${referenceAnalysis.version}`
        );

        return context;
      },
      'Reference learning'
    );
  }

  /**
   * Analyze reference framework
   */
  private async analyzeReference(referencePath: string): Promise<ReferenceFrameworkAnalysis> {
    if (!fs.existsSync(referencePath)) {
      throw new Error(`Reference path does not exist: ${referencePath}`);
    }

    const structure = this.extractStructure(referencePath);
    const conventions = this.extractConventions(referencePath);
    const codeStyle = this.extractCodeStyle(referencePath);
    const abstractionPatterns = this.extractPatterns(referencePath);

    // Extract name and version from package.json
    const packageJsonPath = path.join(referencePath, 'package.json');
    let name = 'reference-framework';
    let version = '1.0.0';

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        name = packageJson.name || name;
        version = packageJson.version || version;
      } catch (error) {
        this.logger.warn(`Failed to parse reference package.json: ${error}`);
      }
    }

    return {
      name,
      version,
      structure,
      conventions,
      codeStyle,
      abstractionPatterns,
    };
  }

  /**
   * Extract folder structure from reference
   */
  private extractStructure(referencePath: string): ReferenceStructure {
    const folders: Record<string, string> = {};
    const keyFiles: Record<string, string> = {};

    // Known framework folders
    const knownFolders = {
      'fixtures': 'Custom Playwright fixtures & shared sessionData',
      'manager': 'Central manager for all page objects',
      'pages': 'Page object classes',
      'resource': 'Test data for different environments',
      'tests': 'Test files organized by feature',
      'utils': 'Utility functions and helpers',
    };

    for (const [folderName, description] of Object.entries(knownFolders)) {
      const folderPath = path.join(referencePath, folderName);
      if (fs.existsSync(folderPath)) {
        folders[folderName] = description;
      }
    }

    // Key files
    const knownFiles = {
      'fixtures': 'fixtures.ts',
      'manager': 'POManager.ts',
      'basePage': 'BasePage.ts',
      'tsconfig': 'tsconfig.json',
      'playwrightConfig': 'playwright.config.ts',
    };

    for (const [key, filename] of Object.entries(knownFiles)) {
      const filePath = path.join(referencePath, filename);
      if (fs.existsSync(filePath)) {
        keyFiles[key] = filename;
      }
    }

    return {
      folders,
      keyFiles,
      fileOrganization: 'Feature-based with shared utilities',
    };
  }

  /**
   * Extract naming conventions
   */
  private extractConventions(referencePath: string): NamingConventions {
    return {
      files: {
        fixtures: 'fixtures.ts',
        manager: 'POManager.ts',
        basePage: 'BasePage.ts',
        pages: '[PageName].ts',
        tests: '[Feature].spec.ts',
        utilities: '[Utility].ts',
        resources: '[Resource].json',
      },
      classes: {
        pageObjects: 'PascalCase (e.g., LoginPage)',
        baseClass: 'BasePage',
        manager: 'POManager',
      },
      methods: {
        general: 'camelCase',
        tests: 'snake_case or descriptive',
        private: 'leadingUnderscore + camelCase',
      },
      variables: {
        constants: 'UPPER_SNAKE_CASE',
        general: 'camelCase',
        boolean: 'is/has/can prefix + camelCase',
      },
    };
  }

  /**
   * Extract code style guide
   */
  private extractCodeStyle(referencePath: string): CodeStyleGuide {
    const tsconfigPath = path.join(referencePath, 'tsconfig.json');
    const prettierPath = path.join(referencePath, '.prettierrc.json');

    let indentation = 2;
    let quotes: 'single' | 'double' = 'single';
    let semicolons = true;
    let trailingComma: 'es5' | 'none' | 'all' = 'es5';

    // Try to read prettier config
    if (fs.existsSync(prettierPath)) {
      try {
        const prettierConfig = JSON.parse(fs.readFileSync(prettierPath, 'utf-8'));
        if (prettierConfig.tabWidth) indentation = prettierConfig.tabWidth;
        if (prettierConfig.singleQuote === false) quotes = 'double';
        if (prettierConfig.semi === false) semicolons = false;
        if (prettierConfig.trailingComma) trailingComma = prettierConfig.trailingComma;
      } catch (error) {
        this.logger.debug(`Failed to parse prettier config: ${error}`);
      }
    }

    return {
      indentation,
      quotes,
      semicolons,
      trailingComma,
      typeAnnotations: 'explicit',
    };
  }

  /**
   * Extract abstraction patterns
   */
  private extractPatterns(referencePath: string): AbstractionPattern[] {
    const patterns: AbstractionPattern[] = [];

    // BasePage pattern
    patterns.push({
      name: 'BasePage Pattern',
      location: 'pages/BasePage.ts',
      purpose: 'Shared actions across all page objects',
      implementation: 'Base class with common methods (click, fill, wait, etc.)',
    });

    // POManager pattern
    patterns.push({
      name: 'Page Object Manager',
      location: 'manager/POManager.ts',
      purpose: 'Central manager for all page objects',
      implementation: 'Singleton pattern managing page instances',
    });

    // Fixtures pattern
    patterns.push({
      name: 'Custom Fixtures',
      location: 'fixtures/fixtures.ts',
      purpose: 'Custom Playwright fixtures & shared sessionData',
      implementation: 'test.extend() with custom setup/teardown',
    });

    // Resource pattern
    patterns.push({
      name: 'Test Data Resources',
      location: 'resource/',
      purpose: 'Environment-specific test data',
      implementation: 'JSON files (beta_data.json, prod_data.json, common_data.json)',
    });

    // Utility pattern
    patterns.push({
      name: 'Utility Functions',
      location: 'utils/',
      purpose: 'Helper functions and configuration loaders',
      implementation: 'Modular utility exports (envConfig.ts, helper.ts, etc.)',
    });

    return patterns;
  }
}
