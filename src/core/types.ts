/**
 * Core TypeScript Interfaces and Types
 * Defines the contract for all agents and utilities
 */

export interface ProjectStructure {
  rootPath: string;
  files: FileInfo[];
  folders: FolderInfo[];
  packageJson: PackageJsonInfo;
  playwrightConfig: PlaywrightConfigInfo;
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  content?: string;
  type: 'fixture' | 'page-object' | 'test' | 'utility' | 'config' | 'other';
}

export interface FolderInfo {
  path: string;
  name: string;
  childCount: number;
  fileCount: number;
}

export interface PackageJsonInfo {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export interface PlaywrightConfigInfo {
  testDir: string;
  timeout: number;
  workers: number;
  browsers: string[];
  reporters: string[];
}

export interface FrameworkAnalysis {
  projectType: 'fixture-based' | 'class-based' | 'pom-based' | 'mixed' | 'unknown';
  patterns: DetectedPattern[];
  architecture: ArchitecturePattern;
  customizations: CustomPattern[];
  confidence: number;
}

export interface DetectedPattern {
  name: string;
  type: 'fixture' | 'page-object' | 'utility' | 'hook' | 'helper';
  location: string;
  description: string;
  confidence: number;
}

export interface ArchitecturePattern {
  fixtureStyle: 'playwright-native' | 'custom' | 'hybrid';
  pomStyle: 'inheritance' | 'composition' | 'mixin' | 'none';
  importStyle: 'es6' | 'commonjs' | 'mixed';
  asyncStyle: 'promise' | 'async-await' | 'mixed';
  testOrganization: 'describe' | 'suite' | 'class' | 'flat';
}

export interface CustomPattern {
  name: string;
  description: string;
  examples: string[];
}

export interface ReferenceFrameworkAnalysis {
  name: string;
  version: string;
  structure: ReferenceStructure;
  conventions: NamingConventions;
  codeStyle: CodeStyleGuide;
  abstractionPatterns: AbstractionPattern[];
}

export interface ReferenceStructure {
  folders: Record<string, string>;
  keyFiles: Record<string, string>;
  fileOrganization: string;
}

export interface NamingConventions {
  files: Record<string, string>;
  classes: Record<string, string>;
  methods: Record<string, string>;
  variables: Record<string, string>;
}

export interface CodeStyleGuide {
  indentation: number;
  quotes: 'single' | 'double';
  semicolons: boolean;
  trailingComma: 'es5' | 'none' | 'all';
  typeAnnotations: 'explicit' | 'inferred';
}

export interface AbstractionPattern {
  name: string;
  location: string;
  purpose: string;
  implementation: string;
}

export interface ConversionResult {
  sourceFile: string;
  outputFile: string;
  status: 'success' | 'partial' | 'failed';
  errors: ConversionError[];
  warnings: ConversionWarning[];
  metrics: ConversionMetrics;
}

export interface ConversionError {
  code: string;
  message: string;
  line?: number;
  column?: number;
  suggestion?: string;
  severity: 'error' | 'critical';
}

export interface ConversionWarning {
  code: string;
  message: string;
  line?: number;
  suggestion?: string;
}

export interface ConversionMetrics {
  linesOfCode: number;
  typeAnnotations: number;
  imports: number;
  exports: number;
  complexity: number;
}

export interface TypeMapping {
  jsType: string;
  tsType: string;
  confidence: number;
  requiresInterface: boolean;
  interfaceDefinition?: string;
}

export interface ImportMapping {
  original: string;
  converted: string;
  type: 'relative' | 'absolute' | 'node_modules';
  resolved: boolean;
}

export interface ValidationResult {
  passed: boolean;
  timestamp: Date;
  compilationErrors: CompilationError[];
  lintErrors: LintError[];
  testResults?: TestResult[];
  duration: number;
}

export interface CompilationError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string;
}

export interface LintError {
  file: string;
  line: number;
  column: number;
  message: string;
  rule: string;
  severity: 'error' | 'warning';
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export interface MigrationReport {
  projectName: string;
  sourceProject: string;
  outputProject: string;
  referenceFramework: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'success' | 'partial' | 'failed';
  statistics: MigrationStatistics;
  conversions: ConversionResult[];
  validation: ValidationResult;
  errors: MigrationError[];
  recommendations: string[];
}

export interface MigrationStatistics {
  totalFiles: number;
  convertedFiles: number;
  failedFiles: number;
  successRate: number;
  totalErrors: number;
  totalWarnings: number;
  typeAnnotationsCoverage: number;
}

export interface MigrationError {
  timestamp: Date;
  stage: string;
  message: string;
  context: Record<string, unknown>;
  recoveryAttempts: number;
  resolved: boolean;
}

export interface AgentContext {
  projectPath: string;
  referencePath?: string;
  outputPath: string;
  analysis: ProjectStructure;
  frameworkAnalysis?: FrameworkAnalysis;
  referenceAnalysis?: ReferenceFrameworkAnalysis;
  conversions: Map<string, ConversionResult>;
  errors: MigrationError[];
  metadata: Record<string, unknown>;
}

export interface AgentConfig {
  maxRetries: number;
  timeout: number;
  verbose: boolean;
  dryRun: boolean;
}

export interface MigrationConfig {
  sourceProjectPath: string;
  outputPath: string;
  referenceProjectPath?: string;
  validateAfterConversion: boolean;
  enableAutoFix: boolean;
  enableSelfHealing: boolean;
  maxRetries: number;
  agentTimeout: number;
  verbose: boolean;
  dryRun: boolean;
}
