/**
 * Mock Data for Testing
 * Provides mock project structures and analysis results
 */

import { ProjectStructure, FrameworkAnalysis, DetectedPattern } from '../../core/types';

export const mockProjectStructure: ProjectStructure = {
  rootPath: '/test/project',
  files: [
    {
      path: 'src/index.js',
      name: 'index.js',
      extension: '.js',
      size: 100,
      content: 'console.log("hello");',
      type: 'other',
    },
    {
      path: 'src/pages/LoginPage.js',
      name: 'LoginPage.js',
      extension: '.js',
      size: 500,
      content: 'class LoginPage {}',
      type: 'page-object',
    },
    {
      path: 'tests/login.spec.js',
      name: 'login.spec.js',
      extension: '.js',
      size: 300,
      content: 'test("should login", () => {});',
      type: 'test',
    },
  ],
  folders: [
    { path: 'src', name: 'src', childCount: 2, fileCount: 1 },
    { path: 'tests', name: 'tests', childCount: 1, fileCount: 1 },
  ],
  packageJson: {
    name: 'test-project',
    version: '1.0.0',
    dependencies: {},
    devDependencies: { '@playwright/test': '^1.40.0' },
    scripts: {},
  },
  playwrightConfig: {
    testDir: './tests',
    timeout: 300000,
    workers: 1,
    browsers: ['chromium'],
    reporters: ['list'],
  },
};

export const mockFrameworkAnalysis: FrameworkAnalysis = {
  projectType: 'class-based',
  patterns: [
    {
      name: 'Class-based Structure',
      type: 'page-object',
      location: 'src/pages/LoginPage.js',
      description: 'Class declarations detected',
      confidence: 0.9,
    },
  ],
  architecture: {
    fixtureStyle: 'playwright-native',
    pomStyle: 'inheritance',
    importStyle: 'commonjs',
    asyncStyle: 'promise',
    testOrganization: 'flat',
  },
  customizations: [],
  confidence: 0.85,
};

export const mockDetectedPatterns: DetectedPattern[] = [
  {
    name: 'Playwright Page Methods',
    type: 'page-object',
    location: 'src/pages/LoginPage.js',
    description: 'Uses Playwright page methods',
    confidence: 0.85,
  },
  {
    name: 'Class: LoginPage',
    type: 'page-object',
    location: 'src/pages/LoginPage.js',
    description: 'Standalone class definition',
    confidence: 0.9,
  },
];
