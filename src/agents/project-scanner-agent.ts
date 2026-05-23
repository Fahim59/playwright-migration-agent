/**
 * Project Scanner Agent
 * Recursively scans a JavaScript Playwright project and builds structural model
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAgent } from './base-agent.ts';
import { AgentContext, ProjectStructure, FileInfo, FolderInfo, PackageJsonInfo, PlaywrightConfigInfo } from '@core/types';
import { FILE_PATTERNS, FOLDER_PATTERNS } from '@core/constants';

export class ProjectScannerAgent extends BaseAgent {
  /**
   * Scan project and build structure
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Scanning project: ${context.projectPath}`);
        this.validateContext(context);

        const projectStructure = await this.scanProject(context.projectPath);
        context.analysis = projectStructure;

        this.logger.success(
          `[${this.getName()}] Scan complete: ${projectStructure.files.length} files found`
        );

        return context;
      },
      'Project scan'
    );
  }

  /**
   * Scan entire project recursively
   */
  private async scanProject(rootPath: string): Promise<ProjectStructure> {
    if (!fs.existsSync(rootPath)) {
      throw new Error(`Project path does not exist: ${rootPath}`);
    }

    const files: FileInfo[] = [];
    const folders: FolderInfo[] = [];

    // Recursively scan directories
    this.scanDirectory(rootPath, rootPath, files, folders);

    // Extract package.json
    const packageJson = this.parsePackageJson(rootPath);

    // Extract Playwright config
    const playwrightConfig = this.parsePlaywrightConfig(rootPath);

    return {
      rootPath,
      files,
      folders,
      packageJson,
      playwrightConfig,
    };
  }

  /**
   * Recursively scan directory
   */
  private scanDirectory(
    currentPath: string,
    rootPath: string,
    files: FileInfo[],
    folders: FolderInfo[]
  ): void {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      // Skip node_modules and common excluded folders
      const excludedFolders = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

      for (const entry of entries) {
        if (excludedFolders.includes(entry.name)) {
          continue;
        }

        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(rootPath, fullPath);

        if (entry.isDirectory()) {
          // Process folder
          const childFiles = fs.readdirSync(fullPath).filter((f) => !f.startsWith('.'));
          folders.push({
            path: relativePath,
            name: entry.name,
            childCount: fs.readdirSync(fullPath).length,
            fileCount: childFiles.filter((f) => !fs.statSync(path.join(fullPath, f)).isDirectory()).length,
          });

          // Recurse into subdirectory
          this.scanDirectory(fullPath, rootPath, files, folders);
        } else {
          // Process file
          const fileInfo = this.createFileInfo(fullPath, relativePath, rootPath);
          if (fileInfo) {
            files.push(fileInfo);
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Failed to scan directory ${currentPath}: ${error}`);
    }
  }

  /**
   * Create file info object
   */
  private createFileInfo(fullPath: string, relativePath: string, rootPath: string): FileInfo | null {
    try {
      const stats = fs.statSync(fullPath);
      const extension = path.extname(fullPath);
      const name = path.basename(fullPath);

      // Skip non-JS/TS files and common exclusions
      if (!FILE_PATTERNS.JAVASCRIPT.test(extension) && !FILE_PATTERNS.TYPESCRIPT.test(extension)) {
        return null;
      }

      // Determine file type
      const type = this.determineFileType(relativePath, name);

      // Read file content if it's not too large
      let content: string | undefined;
      if (stats.size < 1024 * 1024) {
        // Only read files < 1MB
        try {
          content = fs.readFileSync(fullPath, 'utf-8');
        } catch (error) {
          this.logger.warn(`Failed to read file ${relativePath}: ${error}`);
        }
      }

      return {
        path: relativePath,
        name,
        extension,
        size: stats.size,
        content,
        type,
      };
    } catch (error) {
      this.logger.warn(`Failed to process file ${fullPath}: ${error}`);
      return null;
    }
  }

  /**
   * Determine file type based on path and name
   */
  private determineFileType(
    relativePath: string,
    fileName: string
  ): 'fixture' | 'page-object' | 'test' | 'utility' | 'config' | 'other' {
    if (FILE_PATTERNS.FIXTURE.test(fileName)) return 'fixture';
    if (FILE_PATTERNS.TEST.test(fileName)) return 'test';
    if (FILE_PATTERNS.PAGE_OBJECT.test(relativePath)) return 'page-object';
    if (FILE_PATTERNS.UTILITY.test(relativePath)) return 'utility';
    if (fileName === 'package.json' || fileName === 'playwright.config.js' || fileName === 'tsconfig.json') {
      return 'config';
    }
    return 'other';
  }

  /**
   * Parse package.json
   */
  private parsePackageJson(projectPath: string): PackageJsonInfo {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        return {
          name: 'unknown',
          version: '1.0.0',
          dependencies: {},
          devDependencies: {},
          scripts: {},
        };
      }

      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(content);

      return {
        name: packageJson.name || 'unknown',
        version: packageJson.version || '1.0.0',
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {},
        scripts: packageJson.scripts || {},
      };
    } catch (error) {
      this.logger.warn(`Failed to parse package.json: ${error}`);
      return {
        name: 'unknown',
        version: '1.0.0',
        dependencies: {},
        devDependencies: {},
        scripts: {},
      };
    }
  }

  /**
   * Parse playwright.config.js or playwright.config.ts
   */
  private parsePlaywrightConfig(projectPath: string): PlaywrightConfigInfo {
    try {
      const configPaths = [
        path.join(projectPath, 'playwright.config.js'),
        path.join(projectPath, 'playwright.config.ts'),
      ];

      for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
          // For now, return default config
          // In Phase 3, we'll parse the actual config
          return {
            testDir: './tests',
            timeout: 300000,
            workers: 1,
            browsers: ['chromium'],
            reporters: ['list'],
          };
        }
      }

      return {
        testDir: './tests',
        timeout: 300000,
        workers: 1,
        browsers: ['chromium'],
        reporters: ['list'],
      };
    } catch (error) {
      this.logger.warn(`Failed to parse Playwright config: ${error}`);
      return {
        testDir: './tests',
        timeout: 300000,
        workers: 1,
        browsers: ['chromium'],
        reporters: ['list'],
      };
    }
  }
}
