/**
 * Reference Learning Utility
 * Extracts best practices and conventions from reference framework
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@core/logger';
import { NamingConventions, CodeStyleGuide, AbstractionPattern } from '@core/types';

export class ReferenceLearner {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Learn naming conventions from reference files
   */
  learnNamingConventions(referencePath: string): NamingConventions {
    const conventions: NamingConventions = {
      files: {},
      classes: {},
      methods: {},
      variables: {},
    };

    try {
      // Analyze file names
      const srcPath = path.join(referencePath, 'src');
      if (fs.existsSync(srcPath)) {
        this.analyzeFileNames(srcPath, conventions);
      }

      // Analyze code patterns
      const pagesPath = path.join(referencePath, 'pages');
      if (fs.existsSync(pagesPath)) {
        this.analyzeClassNaming(pagesPath, conventions);
      }
    } catch (error) {
      this.logger.warn(`Failed to learn naming conventions: ${error}`);
    }

    return conventions;
  }

  /**
   * Learn code style from reference files
   */
  learnCodeStyle(referencePath: string): CodeStyleGuide {
    const style: CodeStyleGuide = {
      indentation: 2,
      quotes: 'single',
      semicolons: true,
      trailingComma: 'es5',
      typeAnnotations: 'explicit',
    };

    try {
      // Check prettier config
      const prettierPath = path.join(referencePath, '.prettierrc.json');
      if (fs.existsSync(prettierPath)) {
        const prettierConfig = JSON.parse(fs.readFileSync(prettierPath, 'utf-8'));
        if (prettierConfig.tabWidth) style.indentation = prettierConfig.tabWidth;
        if (prettierConfig.singleQuote === false) style.quotes = 'double';
        if (prettierConfig.semi === false) style.semicolons = false;
        if (prettierConfig.trailingComma) style.trailingComma = prettierConfig.trailingComma;
      }

      // Check sample code files
      const sampleFile = this.findSampleFile(referencePath);
      if (sampleFile) {
        this.analyzeCodeStyle(sampleFile, style);
      }
    } catch (error) {
      this.logger.warn(`Failed to learn code style: ${error}`);
    }

    return style;
  }

  /**
   * Learn abstraction patterns from reference
   */
  learnAbstractionPatterns(referencePath: string): AbstractionPattern[] {
    const patterns: AbstractionPattern[] = [];

    try {
      // BasePage pattern
      const basePagePath = path.join(referencePath, 'pages', 'BasePage.ts');
      if (fs.existsSync(basePagePath)) {
        patterns.push({
          name: 'BasePage Pattern',
          location: 'pages/BasePage.ts',
          purpose: 'Shared actions and utilities for all page objects',
          implementation: 'Base class inheritance pattern',
        });
      }

      // POManager pattern
      const pomPath = path.join(referencePath, 'manager', 'POManager.ts');
      if (fs.existsSync(pomPath)) {
        patterns.push({
          name: 'Page Object Manager',
          location: 'manager/POManager.ts',
          purpose: 'Centralized management of page objects',
          implementation: 'Singleton pattern with factory methods',
        });
      }

      // Fixtures pattern
      const fixturesPath = path.join(referencePath, 'fixtures', 'fixtures.ts');
      if (fs.existsSync(fixturesPath)) {
        patterns.push({
          name: 'Custom Fixtures',
          location: 'fixtures/fixtures.ts',
          purpose: 'Custom Playwright fixtures with test context',
          implementation: 'test.extend() with custom setup/teardown',
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to learn patterns: ${error}`);
    }

    return patterns;
  }

  /**
   * Analyze file naming patterns
   */
  private analyzeFileNames(
    dirPath: string,
    conventions: NamingConventions
  ): void {
    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        if (file.endsWith('.ts')) {
          const name = file.replace('.ts', '');

          // Categorize by pattern
          if (file === 'fixtures.ts') {
            conventions.files['fixtures'] = 'fixtures.ts';
          } else if (file === 'BasePage.ts') {
            conventions.files['basePage'] = 'BasePage.ts';
          } else if (file === 'POManager.ts') {
            conventions.files['manager'] = 'POManager.ts';
          } else if (/Page\.ts$/.test(file)) {
            conventions.files['pages'] = '[PageName].ts';
          }
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to analyze file names: ${error}`);
    }
  }

  /**
   * Analyze class naming patterns
   */
  private analyzeClassNaming(
    dirPath: string,
    conventions: NamingConventions
  ): void {
    try {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        if (file.endsWith('.ts')) {
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');

          // Extract class names
          const classMatches = content.match(/class\s+(\w+)/g);
          if (classMatches) {
            for (const match of classMatches) {
              const className = match.replace('class ', '');
              if (className.endsWith('Page')) {
                conventions.classes['pages'] = 'PascalCase + Page suffix';
              }
            }
          }
        }
      }
    } catch (error) {
      this.logger.debug(`Failed to analyze class naming: ${error}`);
    }
  }

  /**
   * Analyze code style from sample files
   */
  private analyzeCodeStyle(filePath: string, style: CodeStyleGuide): void {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Detect quote style
      const singleQuotes = (content.match(/'/g) || []).length;
      const doubleQuotes = (content.match(/"/g) || []).length;
      if (doubleQuotes > singleQuotes) {
        style.quotes = 'double';
      }

      // Detect semicolons
      const semicolons = (content.match(/;/g) || []).length;
      const lines = content.split('\n');
      if (semicolons < lines.length / 2) {
        style.semicolons = false;
      }

      // Detect indentation
      const twoSpaces = (content.match(/^  \S/gm) || []).length;
      const fourSpaces = (content.match(/^    \S/gm) || []).length;
      if (fourSpaces > twoSpaces) {
        style.indentation = 4;
      }
    } catch (error) {
      this.logger.debug(`Failed to analyze code style: ${error}`);
    }
  }

  /**
   * Find a sample file for analysis
   */
  private findSampleFile(referencePath: string): string | null {
    const searchPaths = [
      path.join(referencePath, 'src', 'agents', 'base-agent.ts'),
      path.join(referencePath, 'pages', 'BasePage.ts'),
      path.join(referencePath, 'src', 'core', 'types.ts'),
    ];

    for (const filePath of searchPaths) {
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }

    return null;
  }
}
