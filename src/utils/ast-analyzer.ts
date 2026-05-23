/**
 * AST Analyzer Utility
 * Provides AST analysis capabilities
 */

import { Project, SourceFile } from 'ts-morph';
import { Logger } from '@core/logger';

export class AstAnalyzer {
  private project: Project;
  private logger: Logger;

  constructor() {
    this.project = new Project();
    this.logger = new Logger();
  }

  /**
   * Parse JavaScript/TypeScript code
   */
  parseCode(code: string, fileName: string = 'temp.ts'): SourceFile {
    try {
      const sourceFile = this.project.createSourceFile(fileName, code, {
        overwrite: true,
      });
      return sourceFile;
    } catch (error) {
      this.logger.error(`Failed to parse code: ${error}`);
      throw error;
    }
  }

  /**
   * Extract classes from code
   */
  extractClasses(sourceFile: SourceFile): string[] {
    const classes: string[] = [];
    const classDeclarations = sourceFile.getClasses();

    for (const classDecl of classDeclarations) {
      classes.push(classDecl.getName() || 'Anonymous');
    }

    return classes;
  }

  /**
   * Extract functions from code
   */
  extractFunctions(sourceFile: SourceFile): string[] {
    const functions: string[] = [];
    const functionDeclarations = sourceFile.getFunctions();

    for (const funcDecl of functionDeclarations) {
      functions.push(funcDecl.getName() || 'Anonymous');
    }

    return functions;
  }

  /**
   * Extract imports from code
   */
  extractImports(sourceFile: SourceFile): Array<{ module: string; items: string[] }> {
    const imports: Array<{ module: string; items: string[] }> = [];
    const importDeclarations = sourceFile.getImportDeclarations();

    for (const importDecl of importDeclarations) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      const namedImports = importDecl.getNamedImports().map((ni) => ni.getName());
      const defaultImport = importDecl.getDefaultImport()?.getText();

      const items = [...namedImports];
      if (defaultImport) items.unshift(defaultImport);

      imports.push({
        module: moduleSpecifier,
        items,
      });
    }

    return imports;
  }

  /**
   * Extract exports from code
   */
  extractExports(sourceFile: SourceFile): string[] {
    const exports: string[] = [];
    const exportedDeclarations = sourceFile.getExportedDeclarations();

    for (const [name] of exportedDeclarations) {
      exports.push(name);
    }

    return exports;
  }

  /**
   * Get method signatures from a class
   */
  getClassMethods(sourceFile: SourceFile, className: string): Array<{ name: string; async: boolean; params: string[] }> {
    const methods: Array<{ name: string; async: boolean; params: string[] }> = [];
    const classDecl = sourceFile.getClass(className);

    if (!classDecl) return methods;

    const methodDeclarations = classDecl.getMethods();

    for (const method of methodDeclarations) {
      const params = method.getParameters().map((p) => p.getName());
      methods.push({
        name: method.getName(),
        async: method.isAsync(),
        params,
      });
    }

    return methods;
  }

  /**
   * Check if code has async/await
   */
  hasAsyncAwait(sourceFile: SourceFile): boolean {
    const text = sourceFile.getFullText();
    return /async\s|await\s/.test(text);
  }

  /**
   * Get variable declarations
   */
  getVariableDeclarations(sourceFile: SourceFile): Array<{ name: string; type: string; value: string }> {
    const variables: Array<{ name: string; type: string; value: string }> = [];
    const varDeclarations = sourceFile.getVariableDeclarations();

    for (const varDecl of varDeclarations) {
      variables.push({
        name: varDecl.getName(),
        type: varDecl.getType().getText(),
        value: varDecl.getInitializerIfKind(0)?.getText() || 'undefined',
      });
    }

    return variables;
  }
}
