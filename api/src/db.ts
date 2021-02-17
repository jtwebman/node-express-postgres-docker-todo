import retry from 'async-retry';
import pgPromise from 'pg-promise';

import { Config } from './config';
import { Logger } from './logger';

const pgp = pgPromise({
  capSQL: true,
});

export type Database = pgPromise.IDatabase<unknown>;

export function getDB(config: Config): pgPromise.IDatabase<unknown> {
  return pgp(config.get('DB_CONNECTION'));
}

export function waitDBConnect(db: Database, logger: Logger): Promise<Database> {
  return retry(
    async (_bail, tryCount) => {
      logger.info(`Trying to connect to db ${tryCount}`);
      const conn = await db.connect();
      conn.done();
      logger.info('Connected to db!');
      return db;
    },
    {
      retries: 6,
    }
  );
}
