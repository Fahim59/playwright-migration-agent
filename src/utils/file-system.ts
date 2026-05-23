/**
 * File System Utilities
 * Provides file I/O operations
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@core/logger';

export class FileSystem {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Read file content
   */
  readFile(filePath: string): string {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to read file ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Write file content
   */
  writeFile(filePath: string, content: string): void {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to write file ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Copy file
   */
  copyFile(source: string, destination: string): void {
    try {
      const dir = path.dirname(destination);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.copyFileSync(source, destination);
    } catch (error) {
      this.logger.error(`Failed to copy file from ${source} to ${destination}`, error);
      throw error;
    }
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(source: string, destination: string): void {
    try {
      if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
      }

      const files = fs.readdirSync(source);

      for (const file of files) {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);

        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
        } else {
          this.copyFile(sourcePath, destPath);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to copy directory from ${source} to ${destination}`, error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      this.logger.error(`Failed to delete file ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Delete directory recursively
   */
  deleteDirectory(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      this.logger.error(`Failed to delete directory ${dirPath}`, error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Check if path is directory
   */
  isDirectory(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file size
   */
  getFileSize(filePath: string): number {
    try {
      return fs.statSync(filePath).size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * List files in directory
   */
  listFiles(dirPath: string, recursive = false): string[] {
    const files: string[] = [];

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isFile()) {
          files.push(fullPath);
        } else if (recursive && entry.isDirectory()) {
          files.push(...this.listFiles(fullPath, recursive));
        }
      }
    } catch (error) {
      this.logger.error(`Failed to list files in ${dirPath}`, error);
    }

    return files;
  }

  /**
   * Create directory if not exists
   */
  ensureDirectory(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (error) {
      this.logger.error(`Failed to ensure directory ${dirPath}`, error);
      throw error;
    }
  }
}
