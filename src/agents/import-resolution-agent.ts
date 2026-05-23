/**
 * Import Resolution Agent
 * Resolves import paths and fixes missing imports
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext, ImportMapping } from '@core/types';
import { FileSystem } from '@utils/file-system';
import * as path from 'path';

export class ImportResolutionAgent extends BaseAgent {
  private fileSystem: FileSystem;

  constructor() {
    super();
    this.fileSystem = new FileSystem();
  }

  /**
   * Execute import resolution
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Resolving import paths`);
        this.validateContext(context);

        if (!context.conversions || context.conversions.size === 0) {
          return context;
        }

        const importMappings: Map<string, ImportMapping[]> = new Map();

        for (const [filePath, result] of context.conversions) {
          if (result.status === 'success' || result.status === 'partial') {
            try {
              const outputPath = `${context.outputPath}/${result.outputFile}`;
              let code = this.fileSystem.readFile(outputPath);

              // Resolve imports
              const mappings = this.resolveImports(code, outputPath, context);
              importMappings.set(filePath, mappings);

              // Apply resolved imports
              code = this.applyResolvedImports(code, mappings);

              // Write back
              this.fileSystem.writeFile(outputPath, code);
            } catch (error) {
              this.logger.warn(`Failed to resolve imports in ${filePath}: ${error}`);
            }
          }
        }

        context.metadata.importMappings = importMappings;

        this.logger.success(
          `[${this.getName()}] Import resolution complete: ${importMappings.size} files processed`
        );

        return context;
      },
      'Import resolution'
    );
  }

  /**
   * Resolve imports in code
   */
  private resolveImports(
    code: string,
    filePath: string,
    context: AgentContext
  ): ImportMapping[] {
    const mappings: ImportMapping[] = [];

    // Find all import statements
    const importMatches = code.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"];?/g);

    for (const match of importMatches) {
      const originalPath = match[1];
      let resolved = originalPath;
      let type: 'relative' | 'absolute' | 'node_modules' = 'relative';

      // Determine import type
      if (originalPath.startsWith('.')) {
        type = 'relative';
        // Resolve relative path
        resolved = this.resolveRelativePath(filePath, originalPath, context);
      } else if (originalPath.startsWith('/')) {
        type = 'absolute';
      } else {
        type = 'node_modules';
      }

      mappings.push({
        original: originalPath,
        converted: resolved,
        type,
        resolved: this.isPathResolved(resolved, context),
      });
    }

    return mappings;
  }

  /**
   * Resolve relative path
   */
  private resolveRelativePath(
    currentFile: string,
    importPath: string,
    context: AgentContext
  ): string {
    const currentDir = path.dirname(currentFile);
    const resolved = path.resolve(currentDir, importPath);
    const relative = path.relative(path.dirname(currentFile), resolved);

    // Ensure .ts extension
    if (!relative.includes('.')) {
      return relative + '.ts';
    }

    if (relative.endsWith('.js')) {
      return relative.replace('.js', '.ts');
    }

    return relative;
  }

  /**
   * Check if path is resolved
   */
  private isPathResolved(importPath: string, context: AgentContext): boolean {
    if (!importPath.startsWith('.')) {
      return true; // node_modules
    }

    // Check if file exists
    const fullPath = `${context.outputPath}/${importPath}`;
    return this.fileSystem.fileExists(fullPath);
  }

  /**
   * Apply resolved imports to code
   */
  private applyResolvedImports(code: string, mappings: ImportMapping[]): string {
    for (const mapping of mappings) {
      if (mapping.original !== mapping.converted) {
        const escapedOriginal = mapping.original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        code = code.replace(
          new RegExp(`from\\s+['"]${escapedOriginal}['"]`, 'g'),
          `from '${mapping.converted}'`
        );
      }
    }

    return code;
  }
}
