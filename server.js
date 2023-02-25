'use strict';

const config = require('config');
const stoppable = require('stoppable');

const { getApp } = require('./server/app');
const { getContext } = require('./context');
const { logger } = require('./logger');
const { getWorkers } = require('./workers/worker-client');
const { getDB } = require('./data/db-client');

const killSignals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGUSR2: 12,
  SIGTERM: 15,
};

function shutdown(nodeApp, context, signal, value) {
  context.logger.info(`Trying shutdown, got signal ${signal}`);
  nodeApp.stop(() => {
    context.logger.info('Node app stopped.');
    context.db.$pool.end();
    context.logger.info('DB connections stopped.');
    process.exit(128 + value);
  });
}

function start(context) {
  const app = getApp(context);
  const nodeApp = stoppable(app.listen(config.PORT, () => context.logger.info(`Listening on port ${config.PORT}!`)));

  nodeApp.timeout = 0;
  nodeApp.keepAliveTimeout = 60000; // 60 secs

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

  process.once('SIGUSR2', () => shutdown(nodeApp, context, 'SIGUSR2', killSignals.SIGUSR2));
  process.once('SIGHUP', () => shutdown(nodeApp, context, 'SIGHUP', killSignals.SIGHUP));
  process.once('SIGINT', () => shutdown(nodeApp, context, 'SIGINT', killSignals.SIGINT));
  process.once('SIGTERM', () => shutdown(nodeApp, context, 'SIGTERM', killSignals.SIGTERM));

  return nodeApp;
}

// First get context that waits for the DB to be available before starting the web server
getContext(config, logger, getDB(config.PG_CONNECTION), getWorkers(config))
  .then(start)
  .catch(error => {
    logger.info(`Failed to start services: ${error.stack}`);
    process.exit(1);
  });
