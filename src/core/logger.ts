/**
 * Logging Utility
 */

import chalk from 'chalk';
import { LOG_LEVELS } from './constants';

type LogLevel = keyof typeof LOG_LEVELS;

export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'INFO') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('DEBUG')) {
      console.log(chalk.gray(`[DEBUG] ${message}`), data ? JSON.stringify(data, null, 2) : '');
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('INFO')) {
      console.log(chalk.blue(`[INFO] ${message}`), data ? JSON.stringify(data, null, 2) : '');
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('WARN')) {
      console.warn(chalk.yellow(`[WARN] ${message}`), data ? JSON.stringify(data, null, 2) : '');
    }
  }

  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog('ERROR')) {
      console.error(chalk.red(`[ERROR] ${message}`));
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
        console.error(chalk.red(error.stack || ''));
      } else if (error) {
        console.error(chalk.red(JSON.stringify(error, null, 2)));
      }
    }
  }

  success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  }

  section(title: string): void {
    console.log(chalk.bold.cyan(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}\n`));
  }

  divider(): void {
    console.log(chalk.gray(`\n${'─'.repeat(60)}\n`));
  }
}

export const logger = new Logger(process.env.LOG_LEVEL as LogLevel | undefined);
