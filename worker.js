'use strict';

const config = require('config');

const { getContext } = require('./context');
const { logger } = require('./logger');
const { startWork } = require('./workers/worker');
const { getWorkers } = require('./workers/worker-client');
const { getDB } = require('./data/db-client');

const killSignals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGUSR2: 12,
  SIGTERM: 15,
};

async function shutdown(workers, context, signal, value) {
  context.logger.info(`Trying shutdown, got signal ${signal}`);
  await workers.closeAll();
  context.logger.info('Workers stopped.');
  context.db.$pool.end();
  context.logger.info('DB connections stopped.');
  process.exit(128 + value);
}

function start(context) {
  const workers = startWork(context);
  context.logger.info(`Workers started`);

  process.on('unhandledRejection', (error, promise) => {
    context.logger.error(`unhandledRejection at: ${promise} `, {
      stack: error.stack,
      error: JSON.stringify(error),
    });
  });

  process.on('uncaughtException', error => {
    context.logger.error(`uncaughtException: ${error.message}`, {
      stack: error.stack,
      error: JSON.stringify(error),
    });
  });

  process.once('SIGUSR2', () => shutdown(workers, context, 'SIGUSR2', killSignals.SIGUSR2));
  process.once('SIGHUP', () => shutdown(workers, context, 'SIGHUP', killSignals.SIGHUP));
  process.once('SIGINT', () => shutdown(workers, context, 'SIGINT', killSignals.SIGINT));
  process.once('SIGTERM', () => shutdown(workers, context, 'SIGTERM', killSignals.SIGTERM));

  return workers;
}

// First get context that waits for the DB to be available before starting the workers
getContext(config, logger, getDB(config.PG_CONNECTION), getWorkers(config))
  .then(start)
  .catch(error => {
    logger.info(`Failed to workers: ${error.stack}`);
    process.exit(1);
  });
