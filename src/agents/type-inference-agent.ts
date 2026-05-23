/**
 * Type Inference Agent
 * Infers and applies strict TypeScript types
 */

import { BaseAgent } from './base-agent.ts';
import { AgentContext, TypeMapping } from '@core/types';
import { TypeMapper } from '@utils/type-mapper';
import { FileSystem } from '@utils/file-system';

export class TypeInferenceAgent extends BaseAgent {
  private typeMapper: TypeMapper;
  private fileSystem: FileSystem;

  constructor() {
    super();
    this.typeMapper = new TypeMapper();
    this.fileSystem = new FileSystem();
  }

  /**
   * Execute type inference
   */
  async execute(context: AgentContext): Promise<AgentContext> {
    return this.retry(
      async () => {
        this.logger.info(`[${this.getName()}] Inferring TypeScript types`);
        this.validateContext(context);

        if (!context.conversions || context.conversions.size === 0) {
          this.logger.warn('[${this.getName()}] No files to infer types for');
          return context;
        }

        const typeMappings: Map<string, TypeMapping[]> = new Map();

        for (const [filePath, result] of context.conversions) {
          if (result.status === 'success' || result.status === 'partial') {
            try {
              const outputPath = `${context.outputPath}/${result.outputFile}`;
              let code = this.fileSystem.readFile(outputPath);

              // Infer types
              const mappings = this.inferTypes(code);
              typeMappings.set(filePath, mappings);

              // Apply type annotations
              code = this.applyTypeAnnotations(code, mappings);

              // Write back
              this.fileSystem.writeFile(outputPath, code);
            } catch (error) {
              this.logger.warn(`Failed to infer types for ${filePath}: ${error}`);
            }
          }
        }

        context.metadata.typeMappings = typeMappings;

        this.logger.success(
          `[${this.getName()}] Type inference complete: ${typeMappings.size} files processed`
        );

        return context;
      },
      'Type inference'
    );
  }

  /**
   * Infer types from code
   */
  private inferTypes(code: string): TypeMapping[] {
    const mappings: TypeMapping[] = [];

    // Infer parameter types
    const paramMatches = code.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(['"\w{}\[\]()]+)/g);
    for (const match of paramMatches) {
      const varName = match[1];
      const value = match[2];
      const inferredType = this.inferTypeFromValue(value);
      mappings.push({
        jsType: varName,
        tsType: inferredType,
        confidence: 0.7,
        requiresInterface: false,
      });
    }

    // Infer function parameter types
    const funcMatches = code.matchAll(/(?:async\s+)?(\w+)\s*\(([^)]*)\)/g);
    for (const match of funcMatches) {
      const params = match[2].split(',').map((p) => p.trim());
      for (const param of params) {
        if (param) {
          mappings.push({
            jsType: param,
            tsType: 'unknown',
            confidence: 0.5,
            requiresInterface: false,
          });
        }
      }
    }

    return mappings;
  }

  /**
   * Infer type from value
   */
  private inferTypeFromValue(value: string): string {
    if (value.startsWith('"') || value.startsWith("'")) return 'string';
    if (/^\d+(\.\d+)?$/.test(value)) return 'number';
    if (value === 'true' || value === 'false') return 'boolean';
    if (value.startsWith('[')) return 'unknown[]';
    if (value.startsWith('{')) return 'Record<string, unknown>';
    if (value.includes('async')) return 'Promise<unknown>';
    return 'unknown';
  }

  /**
   * Apply type annotations to code
   */
  private applyTypeAnnotations(code: string, mappings: TypeMapping[]): string {
    for (const mapping of mappings) {
      if (mapping.confidence > 0.8) {
        // Apply high-confidence type
        code = code.replace(
          new RegExp(`\\b${mapping.jsType}\\b`, 'g'),
          `${mapping.jsType}: ${mapping.tsType}`
        );
      }
    }

    return code;
  }
}
