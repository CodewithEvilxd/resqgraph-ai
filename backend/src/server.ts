import { buildApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = buildApp();

async function start(): Promise<void> {
  try {
    const address = await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });
    logger.info(`ResQGraph AI Backend running at ${address}`, {
      port: env.PORT,
      env: env.NODE_ENV,
    });
  } catch (err) {
    logger.error('Failed to start HTTP server', err);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, initiating graceful shutdown...`);
  try {
    await app.close();
    logger.info('Server successfully closed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

start();
