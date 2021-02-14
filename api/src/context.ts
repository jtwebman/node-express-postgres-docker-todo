
import {Logger} from 'winston';

import {Config} from './config';
import {Database, waitDBConnect} from './db';

export interface Context {
  config: Config,
  logger: Logger,
  db: Database
}

export function getContext(config: Config, logger: Logger, db: Database) {
  return waitDBConnect(db, logger)
    .then(db => {
      return {
        config,
        logger,
        db,
      };
    });
}
