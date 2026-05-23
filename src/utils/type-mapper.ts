/**
 * Type Mapper Utility
 * Maps JavaScript types to TypeScript types
 */

import { Logger } from '@core/logger';
import { TypeMapping, JS_TO_TS_TYPE_MAPPING } from '@core/constants';

export class TypeMapper {
  private logger: Logger;
  private mappings: Map<string, TypeMapping> = new Map();

  constructor() {
    this.logger = new Logger();
    this.initializeDefaultMappings();
  }

  /**
   * Initialize default type mappings
   */
  private initializeDefaultMappings(): void {
    for (const [jsType, tsType] of Object.entries(JS_TO_TS_TYPE_MAPPING)) {
      this.mappings.set(jsType, {
        jsType,
        tsType,
        confidence: 0.9,
        requiresInterface: false,
      });
    }
  }

  /**
   * Map a JavaScript type to TypeScript
   */
  mapType(jsType: string): TypeMapping {
    // Check if already mapped
    if (this.mappings.has(jsType)) {
      return this.mappings.get(jsType)!;
    }

    // Try to infer from type string
    let tsType = this.inferType(jsType);
    let confidence = 0.6;
    let requiresInterface = false;

    if (jsType.includes('[]') || jsType.includes('Array')) {
      tsType = `${tsType}[]`;
    }

    if (jsType.includes('Promise') || jsType.includes('async')) {
      tsType = `Promise<${tsType}>`;
    }

    if (/^[A-Z]/.test(jsType)) {
      // Likely a class or interface
      requiresInterface = true;
      confidence = 0.7;
    }

    const mapping: TypeMapping = {
      jsType,
      tsType,
      confidence,
      requiresInterface,
    };

    this.mappings.set(jsType, mapping);
    return mapping;
  }

  /**
   * Infer TypeScript type from JavaScript type string
   */
  private inferType(jsType: string): string {
    const lowerType = jsType.toLowerCase();

    if (
      lowerType.includes('string') ||
      lowerType.includes('str') ||
      lowerType === 'text'
    ) {
      return 'string';
    }

    if (
      lowerType.includes('number') ||
      lowerType.includes('num') ||
      lowerType.includes('int') ||
      lowerType === 'count'
    ) {
      return 'number';
    }

    if (
      lowerType.includes('boolean') ||
      lowerType.includes('bool') ||
      lowerType.includes('is') ||
      lowerType.includes('has')
    ) {
      return 'boolean';
    }

    if (
      lowerType.includes('object') ||
      lowerType.includes('obj') ||
      lowerType.includes('map')
    ) {
      return 'Record<string, unknown>';
    }

    if (
      lowerType.includes('array') ||
      lowerType.includes('list') ||
      lowerType.includes('items')
    ) {
      return 'unknown[]';
    }

    if (
      lowerType.includes('function') ||
      lowerType.includes('func') ||
      lowerType.includes('callback')
    ) {
      return '(...args: unknown[]) => unknown';
    }

    if (
      lowerType.includes('promise') ||
      lowerType.includes('async')
    ) {
      return 'Promise<unknown>';
    }

    if (
      lowerType.includes('error') ||
      lowerType.includes('exception')
    ) {
      return 'Error';
    }

    if (lowerType.includes('date') || lowerType.includes('time')) {
      return 'Date';
    }

    return 'unknown';
  }

  /**
   * Create interface definition for complex type
   */
  createInterfaceDefinition(
    interfaceName: string,
    properties: Record<string, string>
  ): string {
    let definition = `interface ${interfaceName} {\n`;

    for (const [propName, propType] of Object.entries(properties)) {
      definition += `  ${propName}: ${propType};\n`;
    }

    definition += '}';
    return definition;
  }

  /**
   * Map multiple types at once
   */
  mapTypes(jsTypes: string[]): TypeMapping[] {
    return jsTypes.map((jsType) => this.mapType(jsType));
  }

  /**
   * Get all cached mappings
   */
  getAllMappings(): Map<string, TypeMapping> {
    return this.mappings;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.mappings.clear();
    this.initializeDefaultMappings();
  }
}
