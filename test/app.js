'use strict';
const config = require('config');

const { getApp } = require('../server/app');
const { getContext } = require('../context');
const { getDB } = require('../data/db-client');
const { getWorkers } = require('../workers/worker-client');
const { logger } = require('../logger');
const { runMigrations } = require('../db/migrate');

const db = getDB(config.PG_CONNECTION);
const workers = getWorkers(config);

async function getTestApp(overrideContext = {}) {
  const context = await getContext(
    overrideContext.config || config,
    overrideContext.logger || logger,
    overrideContext.db || db,
    overrideContext.workers || workers,
  );
  return getApp(context);
}

before(async () => {
  await runMigrations(config, logger);
});

after(async () => {
  await db.$pool.end();
  await workers.closeAll();
});

module.exports = {
  getTestApp,
  db,
};
