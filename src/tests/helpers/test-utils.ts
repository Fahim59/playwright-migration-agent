/**
 * Test Utilities
 * Helper functions for testing
 */

import { AgentContext } from '../../core/types';
import * as fs from 'fs';
import * as path from 'path';

export function createTestContext(projectPath: string, outputPath: string): AgentContext {
  return {
    projectPath,
    outputPath,
    analysis: {} as any,
    conversions: new Map(),
    errors: [],
    metadata: {},
  };
}

export function createTestFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

export function readTestFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

export function cleanupTestDir(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

export function expectFileExists(filePath: string): void {
  expect(fs.existsSync(filePath)).toBe(true);
}

export function expectFileContains(filePath: string, content: string): void {
  const fileContent = readTestFile(filePath);
  expect(fileContent).toContain(content);
}

export function expectFilesEqual(filePath1: string, filePath2: string): void {
  const content1 = readTestFile(filePath1);
  const content2 = readTestFile(filePath2);
  expect(content1).toBe(content2);
}
