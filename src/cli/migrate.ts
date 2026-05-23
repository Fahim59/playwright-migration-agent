/**
 * Migration CLI
 * Main entry point for migration via command line
 */

import { ConfigLoader } from '@core/config-loader';
import { Orchestrator } from '@core/orchestrator';
import { Logger } from '@core/logger';
import { ReportGenerator } from '@utils/report-generator';

async function main(): Promise<void> {
  const logger = new Logger(process.env.LOG_LEVEL as any);

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const sourceProject = getArgValue(args, '--source', '-s');
    const outputPath = getArgValue(args, '--output', '-o') || './migration-output';
    const referenceProject = getArgValue(args, '--reference', '-r');
    const verbose = args.includes('--verbose') || args.includes('-v');

    if (!sourceProject) {
      logger.error('Missing required argument: --source');
      printHelp();
      process.exit(1);
    }

    // Load configuration
    const configLoader = new ConfigLoader();
    const config = configLoader.loadConfig(sourceProject, outputPath, referenceProject);

    // Create and run orchestrator
    const orchestrator = new Orchestrator(config);
    const report = await orchestrator.migrate();

    // Generate reports
    const reportGenerator = new ReportGenerator();
    reportGenerator.generateJsonReport(report, outputPath);
    reportGenerator.generateHtmlReport(report, outputPath);

    // Print summary
    printSummary(report);

    process.exit(report.status === 'success' ? 0 : 1);
  } catch (error) {
    logger.error('Fatal error', error);
    process.exit(1);
  }
}

function getArgValue(args: string[], ...names: string[]): string | undefined {
  for (const name of names) {
    const index = args.indexOf(name);
    if (index !== -1 && index + 1 < args.length) {
      return args[index + 1];
    }
  }
  return undefined;
}

function printHelp(): void {
  console.log(`
🎭 Playwright Migration Agent

Usage:
  npm run migrate -- [options]

Options:
  --source, -s <path>        Source JavaScript project path (required)
  --output, -o <path>        Output directory (default: ./migration-output)
  --reference, -r <path>     Reference TypeScript framework path (optional)
  --verbose, -v              Enable verbose logging
  --dry-run                   Show what would be migrated without making changes

Example:
  npm run migrate -- --source ./my-js-project --output ./my-ts-project
  `);
}

function printSummary(report: any): void {
  console.log(`
✅ Migration Summary
${'='.repeat(60)}
Project: ${report.projectName}
Status: ${report.status.toUpperCase()}
Duration: ${(report.duration / 1000).toFixed(2)}s

Statistics:
  Total Files: ${report.statistics.totalFiles}
  Converted: ${report.statistics.convertedFiles}
  Failed: ${report.statistics.failedFiles}
  Success Rate: ${report.statistics.successRate.toFixed(2)}%

Output: ${report.outputProject}
${'='.repeat(60)}
  `);
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
