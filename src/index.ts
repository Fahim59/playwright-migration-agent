/**
 * Main entry point for Playwright Migration Agent
 */

import { logger } from './core/logger';
import { SYSTEM_CONSTANTS } from './core/constants';

async function main(): Promise<void> {
  try {
    logger.section(`🎭 ${SYSTEM_CONSTANTS.PROJECT_NAME} v${SYSTEM_CONSTANTS.VERSION}`);

    logger.info('Migration agent initialized');
    logger.info('Use CLI commands to start migration');
    logger.info('Example: npm run migrate -- --source ./my-js-project');
  } catch (error) {
    logger.error('Failed to initialize', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unexpected error', error);
  process.exit(1);
});
