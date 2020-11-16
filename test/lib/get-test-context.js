'use strict';

const config = require('config');

const getDBConnection = require('../../server/data/get-db-connection');
const getContext = require('../../server/get-context');
const getLogger = require('../../server/lib/get-logger');

const db = getDBConnection(config);
const logger = getLogger(config);
let context;

/**
 * Gets the test app context
 * @return {Promise<{config: object, db: object}>} a promise resolving to the context
 */
async function getTestContext() {
  if (!context) {
    context = await getContext(config, logger, db);
  }
  return context;
}

before(async () => {
  context = await getTestContext();
});

after(async () => {
  await context.db.$pool.end();
});

module.exports = getTestContext;
