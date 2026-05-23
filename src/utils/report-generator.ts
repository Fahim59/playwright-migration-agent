/**
 * Report Generator
 * Generates migration reports in JSON and HTML formats
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@core/logger';
import { MigrationReport } from '@core/types';

export class ReportGenerator {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Generate JSON report
   */
  generateJsonReport(report: MigrationReport, outputDir: string): string {
    const reportPath = path.join(outputDir, 'migration-report.json');

    try {
      const json = JSON.stringify(report, null, 2);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(reportPath, json, 'utf-8');

      this.logger.success(`JSON report generated: ${reportPath}`);
      return reportPath;
    } catch (error) {
      this.logger.error(`Failed to generate JSON report: ${error}`);
      throw error;
    }
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(report: MigrationReport, outputDir: string): string {
    const reportPath = path.join(outputDir, 'migration-report.html');

    try {
      const html = this.buildHtmlReport(report);
      fs.mkdirSync(outputDir, { recursive: true });
      fs.writeFileSync(reportPath, html, 'utf-8');

      this.logger.success(`HTML report generated: ${reportPath}`);
      return reportPath;
    } catch (error) {
      this.logger.error(`Failed to generate HTML report: ${error}`);
      throw error;
    }
  }

  /**
   * Build HTML report content
   */
  private buildHtmlReport(report: MigrationReport): string {
    const { statistics, status, startTime, endTime, duration } = report;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright Migration Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    .status { padding: 10px; border-radius: 4px; margin: 20px 0; font-weight: bold; }
    .status.success { background: #d4edda; color: #155724; }
    .status.failed { background: #f8d7da; color: #721c24; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
    .stat-card h3 { margin: 0 0 10px 0; color: #666; font-size: 12px; text-transform: uppercase; }
    .stat-card .value { font-size: 32px; font-weight: bold; color: #333; }
    .errors { background: #fff5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #f85149; }
    .error-item { padding: 10px; border-bottom: 1px solid #ffe0e0; }
    .error-item:last-child { border-bottom: none; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    tr:hover { background: #f8f9fa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎭 Playwright Migration Report</h1>
    
    <div class="status ${status}">
      Status: ${status.toUpperCase()}
    </div>

    <div class="stats">
      <div class="stat-card">
        <h3>Total Files</h3>
        <div class="value">${statistics.totalFiles}</div>
      </div>
      <div class="stat-card">
        <h3>Converted</h3>
        <div class="value">${statistics.convertedFiles}</div>
      </div>
      <div class="stat-card">
        <h3>Success Rate</h3>
        <div class="value">${statistics.successRate.toFixed(1)}%</div>
      </div>
    </div>

    <h2>Conversion Details</h2>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Status</th>
          <th>Lines of Code</th>
          <th>Type Annotations</th>
        </tr>
      </thead>
      <tbody>
        ${report.conversions
          .map(
            (c) => `
        <tr>
          <td>${c.outputFile}</td>
          <td>${c.status}</td>
          <td>${c.metrics.linesOfCode}</td>
          <td>${c.metrics.typeAnnotations}</td>
        </tr>
      `
          )
          .join('')}
      </tbody>
    </table>

    ${report.errors.length > 0
      ? `
    <h2>Errors</h2>
    <div class="errors">
      ${report.errors
        .map(
          (e) => `
      <div class="error-item">
        <strong>${e.stage}</strong>: ${e.message}
      </div>
      `
        )
        .join('')}
    </div>
    `
      : ''}

    <h2>Recommendations</h2>
    <ul>
      ${report.recommendations.map((r) => `<li>${r}</li>`).join('')}
    </ul>

    <hr>
    <p><small>Generated: ${new Date().toLocaleString()}</small></p>
  </div>
</body>
</html>`;
  }
}
