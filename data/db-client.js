'use strict';

const pgPromise = require('pg-promise');
const retry = require('async-retry');

const pgpConfig = {
  capSQL: true,
  noWarnings: true,
  query: e => {
    if (process.env.SHOW_SQL === '1') {
      // eslint-disable-next-line no-console
      console.log(e.query);
    }
  },
};

const pgp = pgPromise(pgpConfig);
pgp.pg.defaults.max = 50; // set pool size to 50

function getDB(conn) {
  return pgp(conn);
}

function waitDBConnect(db, retries = 6) {
  return retry(
    async () => {
      const conn = await db.connect();
      conn.done();
      return db;
    },
    {
      retries,
    },
  );
}

module.exports = {
  getDB,
  pgp,
  waitDBConnect,
};
