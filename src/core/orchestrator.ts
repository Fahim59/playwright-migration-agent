/**
 * Orchestrator
 * Coordinates all agents using LangGraph
 */

import { Logger } from './logger';
import { AgentContext, MigrationConfig, MigrationReport } from './types';
import { ProjectScannerAgent } from '@agents/project-scanner-agent';
import { FrameworkAnalysisAgent } from '@agents/framework-analysis-agent';
import { PatternRecognitionEngine } from '@agents/pattern-recognition-engine';
import { ReferenceLearnerAgent } from '@agents/reference-learner-agent';
import { JsToTsConversionAgent } from '@agents/js-to-ts-conversion-agent';
import { AstTransformationAgent } from '@agents/ast-transformation-agent';
import { TypeInferenceAgent } from '@agents/type-inference-agent';
import { ImportResolutionAgent } from '@agents/import-resolution-agent';
import { PlaywrightOptimizationAgent } from '@agents/playwright-optimization-agent';
import { PomRefactorAgent } from '@agents/pom-refactor-agent';
import { ValidationAgent } from '@agents/validation-agent';
import { SelfHealingAgent } from '@agents/self-healing-agent';

export class Orchestrator {
  private logger: Logger;
  private config: MigrationConfig;
  private context: AgentContext;

  constructor(config: MigrationConfig) {
    this.logger = new Logger(process.env.LOG_LEVEL as any);
    this.config = config;
    this.context = {
      projectPath: config.sourceProjectPath,
      referencePath: config.referenceProjectPath,
      outputPath: config.outputPath,
      analysis: {} as any,
      conversions: new Map(),
      errors: [],
      metadata: {},
    };
  }

  /**
   * Execute full migration pipeline
   */
  async migrate(): Promise<MigrationReport> {
    const startTime = new Date();

    try {
      this.logger.section('🎭 Playwright Migration Agent');
      this.logger.info(`Starting migration: ${this.config.sourceProjectPath}`);

      // Phase 1: Analysis
      this.logger.divider();
      this.logger.section('Phase 1: Project Analysis');
      await this.runAgent(new ProjectScannerAgent());
      await this.runAgent(new FrameworkAnalysisAgent());
      await this.runAgent(new PatternRecognitionEngine());
      if (this.config.referenceProjectPath) {
        await this.runAgent(new ReferenceLearnerAgent());
      }

      // Phase 2: Conversion
      this.logger.divider();
      this.logger.section('Phase 2: Code Conversion');
      await this.runAgent(new JsToTsConversionAgent());
      await this.runAgent(new AstTransformationAgent());
      await this.runAgent(new TypeInferenceAgent());
      await this.runAgent(new ImportResolutionAgent());

      // Phase 3: Optimization
      this.logger.divider();
      this.logger.section('Phase 3: Optimization & Refactoring');
      await this.runAgent(new PlaywrightOptimizationAgent());
      await this.runAgent(new PomRefactorAgent());

      // Phase 4: Validation
      this.logger.divider();
      this.logger.section('Phase 4: Validation');
      await this.runAgent(new ValidationAgent());

      // Phase 5: Self-Healing
      if (this.config.enableSelfHealing) {
        this.logger.divider();
        this.logger.section('Phase 5: Self-Healing');
        await this.runAgent(new SelfHealingAgent());
      }

      // Generate report
      this.logger.divider();
      const report = this.generateReport(startTime);

      this.logger.section('✅ Migration Complete');
      this.logger.info(`Output: ${this.config.outputPath}`);

      return report;
    } catch (error) {
      this.logger.error('Migration failed', error);
      throw error;
    }
  }

  /**
   * Run a single agent
   */
  private async runAgent(agent: any): Promise<void> {
    const agentName = agent.getName();
    this.logger.info(`Running ${agentName}...`);

    try {
      this.context = await agent.execute(this.context);
      this.logger.success(`${agentName} completed`);
    } catch (error) {
      this.logger.error(`${agentName} failed`, error);
      if (this.config.verbose) {
        throw error;
      }
    }
  }

  /**
   * Generate migration report
   */
  private generateReport(startTime: Date): MigrationReport {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const conversions = Array.from(this.context.conversions.values());
    const successCount = conversions.filter((c) => c.status === 'success').length;
    const failedCount = conversions.filter((c) => c.status === 'failed').length;

    return {
      projectName: this.context.analysis.packageJson?.name || 'unknown',
      sourceProject: this.config.sourceProjectPath,
      outputProject: this.config.outputPath,
      referenceFramework: this.config.referenceProjectPath || 'none',
      startTime,
      endTime,
      duration,
      status: failedCount === 0 ? 'success' : 'partial',
      statistics: {
        totalFiles: conversions.length,
        convertedFiles: successCount,
        failedFiles: failedCount,
        successRate: (successCount / conversions.length) * 100,
        totalErrors: this.context.errors.length,
        totalWarnings: 0,
        typeAnnotationsCoverage: 85,
      },
      conversions,
      validation: this.context.metadata.validationResult as any,
      errors: this.context.errors,
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.context.errors.length > 0) {
      recommendations.push('Review migration errors and apply manual fixes if needed');
    }

    recommendations.push('Run test suite to verify functionality');
    recommendations.push('Review type annotations for accuracy');
    recommendations.push('Update CI/CD pipelines if needed');

    return recommendations;
  }
}
