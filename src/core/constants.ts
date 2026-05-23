/**
 * System Constants
 */

export const SYSTEM_CONSTANTS = {
  VERSION: '1.0.0',
  PROJECT_NAME: 'Playwright Migration Agent',
  AUTHOR: 'Fahim59',
  LICENSE: 'MIT',
};

export const DEFAULT_TIMEOUTS = {
  AGENT_TIMEOUT: 300000, // 5 minutes
  VALIDATION_TIMEOUT: 60000, // 1 minute
  CONVERSION_TIMEOUT: 180000, // 3 minutes
};

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000, // 2 seconds
  BACKOFF_MULTIPLIER: 1.5,
};

export const FILE_PATTERNS = {
  JAVASCRIPT: /\.(js|jsx)$/,
  TYPESCRIPT: /\.(ts|tsx)$/,
  JSON: /\.json$/,
  FIXTURE: /(fixtures?|test-setup)\.(js|ts)$/i,
  PAGE_OBJECT: /pages?\/(\w+)\.(js|ts)$/i,
  TEST: /(test|spec)\.(js|ts)$/i,
  UTILITY: /utils?\/(\w+)\.(js|ts)$/i,
};

export const FOLDER_PATTERNS = {
  FIXTURES: ['fixtures', '__fixtures__', 'test-fixtures'],
  PAGES: ['pages', 'po', 'page-objects', 'pom'],
  TESTS: ['tests', 'test', '__tests__', 'e2e'],
  UTILS: ['utils', 'helpers', 'lib', 'common'],
  RESOURCES: ['resources', 'data', 'fixtures/data', 'test-data'],
};

export const PLAYWRIGHT_CONFIG_KEYS = [
  'testDir',
  'timeout',
  'expect',
  'retries',
  'workers',
  'projects',
  'reporter',
  'use',
  'webServer',
];

export const JS_TO_TS_TYPE_MAPPING: Record<string, string> = {
  'string': 'string',
  'number': 'number',
  'boolean': 'boolean',
  'object': 'Record<string, unknown>',
  'array': 'unknown[]',
  'function': '(...args: unknown[]) => unknown',
  'undefined': 'undefined',
  'null': 'null',
  'any': 'unknown',
  'Promise': 'Promise<unknown>',
  'Date': 'Date',
  'Error': 'Error',
  'RegExp': 'RegExp',
  'Map': 'Map<unknown, unknown>',
  'Set': 'Set<unknown>',
  'WeakMap': 'WeakMap<object, unknown>',
  'WeakSet': 'WeakSet<object>',
};

export const COMMON_IMPORTS = {
  PLAYWRIGHT: {
    test: "import { test, expect } from '@playwright/test';",
    page: "import { Page } from '@playwright/test';",
    browser: "import { Browser, BrowserContext } from '@playwright/test';",
  },
  FAKER: {
    default: "import { faker } from '@faker-js/faker';",
  },
  DOTENV: {
    config: "import dotenv from 'dotenv';",
  },
};

export const AGENT_NAMES = [
  'ProjectScannerAgent',
  'FrameworkAnalysisAgent',
  'PatternRecognitionEngine',
  'ReferenceLearnerAgent',
  'JsToTsConversionAgent',
  'AstTransformationAgent',
  'TypeInferenceAgent',
  'ImportResolutionAgent',
  'PlaywrightOptimizationAgent',
  'PomRefactorAgent',
  'ValidationAgent',
  'SelfHealingAgent',
];

export const COMMON_PATTERNS = {
  FIXTURE_PATTERN: /export\s+(?:const|let)\s+(\w+)\s*=.*?test\.extend/,
  CLASS_PATTERN: /class\s+(\w+)\s*(?:extends\s+(\w+))?\s*{/,
  ASYNC_FUNCTION: /async\s+(?:function\s+)?(\w+)|const\s+(\w+)\s*=\s*async/,
  EXPORT_PATTERN: /(export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const)\s+\w+)|(module\.exports\s*=)/,
};

export const ERROR_CODES = {
  SCAN_FAILED: 'SCAN_001',
  ANALYSIS_FAILED: 'ANALYSIS_001',
  CONVERSION_FAILED: 'CONVERSION_001',
  TYPE_INFERENCE_FAILED: 'TYPE_INFERENCE_001',
  VALIDATION_FAILED: 'VALIDATION_001',
  SELF_HEAL_FAILED: 'SELF_HEAL_001',
  IMPORT_RESOLUTION_FAILED: 'IMPORT_001',
};

export const CONVERSION_STAGES = [
  'scan',
  'analyze',
  'pattern-detection',
  'reference-learning',
  'conversion',
  'ast-transformation',
  'type-inference',
  'import-resolution',
  'optimization',
  'refactoring',
  'validation',
  'self-healing',
];

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};
