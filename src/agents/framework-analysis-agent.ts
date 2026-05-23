/**
 * Framework Analysis Agent
 * Analyzes project structure to understand architecture and patterns
 */

import { BaseAgent } from './base-agent.ts';
import {
  AgentContext,
  ProjectStructure,
  FrameworkAnalysis,
  DetectedPattern,
  ArchitecturePattern,
  CustomPattern,
} from '@core/types';
import { FOLDER_PATTERNS, FILE_PATTERNS } from '@core/constants';

export class FrameworkAnalysisAgent extends BaseAgent {
  /**
   * Analyze framework
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Analyzing framework structure`);
        this.validateContext(context);

        if (!context.analysis) {
          throw new Error('Project structure not analyzed. Run ProjectScannerAgent first.');
        }

        const frameworkAnalysis = this.analyzeFramework(context.analysis);
        context.frameworkAnalysis = frameworkAnalysis;

        this.logger.success(
          `[${this.getName()}] Analysis complete: ${frameworkAnalysis.projectType} framework (${frameworkAnalysis.confidence * 100}% confidence)`
        );

        return context;
      },
      'Framework analysis'
    );
  }

  /**
   * Analyze project structure
   */
  private analyzeFramework(projectStructure: ProjectStructure): FrameworkAnalysis {
    const patterns: DetectedPattern[] = [];
    const customPatterns: CustomPattern[] = [];

    // Analyze folder structure
    const folderAnalysis = this.analyzeFolderStructure(projectStructure.folders);

    // Detect patterns in files
    for (const file of projectStructure.files) {
      if (file.content) {
        const filePatterns = this.detectFilePatterns(file);
        patterns.push(...filePatterns);
      }
    }

    // Determine project type
    const projectType = this.determineProjectType(patterns, folderAnalysis);

    // Extract architecture pattern
    const architecture = this.extractArchitecture(projectStructure, patterns);

    // Calculate confidence
    const confidence = this.calculateConfidence(patterns, architecture);

    return {
      projectType,
      patterns,
      architecture,
      customizations: customPatterns,
      confidence,
    };
  }

  /**
   * Analyze folder structure
   */
  private analyzeFolderStructure(folders: any[]): Record<string, boolean> {
    const result: Record<string, boolean> = {};

    for (const [key, folderNames] of Object.entries(FOLDER_PATTERNS)) {
      const found = folders.some((folder) =>
        (folderNames as string[]).includes(folder.name.toLowerCase())
      );
      result[key.toLowerCase()] = found;
    }

    return result;
  }

  /**
   * Detect patterns in a file
   */
  private detectFilePatterns(file: any): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const content = file.content || '';

    // Fixture pattern: test.extend
    if (content.includes('test.extend') || content.includes('fixtures')) {
      patterns.push({
        name: 'Playwright Fixtures',
        type: 'fixture',
        location: file.path,
        description: 'Custom Playwright fixtures detected',
        confidence: 0.95,
      });
    }

    // Class-based pattern
    if (/^class\s+\w+/m.test(content)) {
      patterns.push({
        name: 'Class-based Structure',
        type: 'page-object',
        location: file.path,
        description: 'Class declarations detected',
        confidence: 0.9,
      });
    }

    // Page Object Model pattern
    if (
      content.includes('extend') ||
      (content.includes('class') && content.includes('this.page')) ||
      content.includes('async clickElement')
    ) {
      patterns.push({
        name: 'Page Object Model',
        type: 'page-object',
        location: file.path,
        description: 'POM pattern detected',
        confidence: 0.85,
      });
    }

    // Helper/Utility pattern
    if (/static\s+\w+|module\.exports\s*=\s*{/m.test(content)) {
      patterns.push({
        name: 'Utility Functions',
        type: 'utility',
        location: file.path,
        description: 'Helper/utility functions detected',
        confidence: 0.8,
      });
    }

    // Hook pattern
    if (/beforeAll|afterAll|beforeEach|afterEach|setUp|tearDown/m.test(content)) {
      patterns.push({
        name: 'Test Hooks',
        type: 'utility',
        location: file.path,
        description: 'Test setup/teardown hooks detected',
        confidence: 0.85,
      });
    }

    // Faker pattern
    if (content.includes('faker') || content.includes('@faker-js')) {
      patterns.push({
        name: 'Data Generation',
        type: 'utility',
        location: file.path,
        description: 'Faker data generation detected',
        confidence: 0.9,
      });
    }

    return patterns;
  }

  /**
   * Determine overall project type
   */
  private determineProjectType(
    patterns: DetectedPattern[],
    folderAnalysis: Record<string, boolean>
  ): 'fixture-based' | 'class-based' | 'pom-based' | 'mixed' | 'unknown' {
    const fixtureCount = patterns.filter((p) => p.type === 'fixture').length;
    const classCount = patterns.filter((p) => p.name === 'Class-based Structure').length;
    const pomCount = patterns.filter((p) => p.name === 'Page Object Model').length;

    if (fixtureCount > 0 && pomCount === 0) return 'fixture-based';
    if (classCount > pomCount && classCount > 0) return 'class-based';
    if (pomCount > 0) return 'pom-based';
    if (fixtureCount > 0 || classCount > 0 || pomCount > 0) return 'mixed';
    return 'unknown';
  }

  /**
   * Extract architecture pattern
   */
  private extractArchitecture(
    projectStructure: ProjectStructure,
    patterns: DetectedPattern[]
  ): ArchitecturePattern {
    const fileContent = projectStructure.files
      .map((f) => f.content || '')
      .join('\n');

    return {
      fixtureStyle: fileContent.includes('test.extend') ? 'custom' : 'playwright-native',
      pomStyle: fileContent.includes('extends') ? 'inheritance' : 'composition',
      importStyle: fileContent.includes('import ') ? 'es6' : 'commonjs',
      asyncStyle: fileContent.includes('async ') ? 'async-await' : 'promise',
      testOrganization: fileContent.includes('describe') ? 'describe' : 'flat',
    };
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(patterns: DetectedPattern[], architecture: ArchitecturePattern): number {
    if (patterns.length === 0) return 0.3;
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    return Math.min(0.99, avgConfidence * 0.9 + 0.1);
  }
}
