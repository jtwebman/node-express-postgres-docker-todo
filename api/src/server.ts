import stoppable from 'stoppable';

import { getApp } from './app';
import { getConfig } from './config';
import { Context, getContext } from './context';
import { getDB } from './db';
import { getLogger } from './logger';
import { getStatusApp } from './status';

const config = getConfig();
const port = config.get('PORT');
const statusPort = config.get('STATUS_PORT');
const db = getDB(config);
const logger = getLogger(config);

const killSignals = {
  SIGHUP: 1,
  SIGINT: 2,
  SIGUSR2: 12,
  SIGTERM: 15,
};

/**
 * Shutdown apps correctly
 * @param  {Object} nodeApp the node express app
 * @param  {Object} statusApp the status express app
 * @param  {Object} context the app context
 * @param  {String} signal signal used to exit
 * @param  {Number} value  signal value
 */
function shutdown(
  nodeApp: stoppable.StoppableServer,
  statusApp: stoppable.StoppableServer,
  context: Context,
  signal: string,
  value: number
) {
  context.logger.info(`Trying shutdown, got signal ${signal}`);
  nodeApp.stop(() => {
    context.logger.info('Node app stopped.');
    statusApp.stop(() => {
      context.logger.info('Status app stopped.');
      context.db.$pool.end();
      context.logger.info('DB connections stopped.');
      process.exit(128 + value);
    });
  });
}

/**
 * Starts the express node and status apps with graceful shutdown
 * @param {Object} context object container db, config, etc...
 */
function start(context: Context) {
  const app = getApp(context);
  const status = getStatusApp();

  const nodeApp = stoppable(app.listen(port, () => context.logger.info(`Node app listening on port ${port}!`)));
  const statusApp = stoppable(status.listen(statusPort));

  process.once('SIGUSR2', () => shutdown(nodeApp, statusApp, context, 'SIGUSR2', killSignals.SIGUSR2));
  process.once('SIGHUP', () => shutdown(nodeApp, statusApp, context, 'SIGHUP', killSignals.SIGHUP));
  process.once('SIGINT', () => shutdown(nodeApp, statusApp, context, 'SIGINT', killSignals.SIGINT));
  process.once('SIGTERM', () => shutdown(nodeApp, statusApp, context, 'SIGTERM', killSignals.SIGTERM));
}

getContext(config, logger, db)
  .then(start)
  .catch((error) => {
    logger.info(`Failed to start services: ${error.stack}`);
    process.exit(1);
  });
