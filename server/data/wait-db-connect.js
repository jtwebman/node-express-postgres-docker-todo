'use strict';

const retry = require('async-retry')
;
/**
 * Trys to connect to the DB 20 times backing off each time with a delay.
 * Used when starting the server as well as to wait for tests
 * @param {Object} db PG-Promise db object
 * @param {Object} logger the winston logger client object
 * @return {Promise<Object>} resolves db object passed in after connecting to db
 */
function waitDBConnect(db, logger) {
  return retry(async (_bail, tryCount) => {
    logger.info(`Trying to connect to db ${tryCount}`);
    const conn = await db.connect();
    conn.done();
    logger.info('Connected to db!');
    return db;
  }, {
    retries: 6,
  });
}

module.exports = waitDBConnect;
