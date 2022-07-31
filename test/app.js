'use strict';
const config = require('config');

const { getApp } = require('../server/app');
const { getContext } = require('../server/context');
const { getDB } = require('../server/db/pg-client');
const { logger } = require('../server/logger');
const { runMigrations } = require('../db/migrate');

const db = getDB(config.PG_CONNECTION);

async function getTestApp(overrideContext = {}) {
  const context = await getContext(
    overrideContext.config || config,
    overrideContext.logger || logger,
    overrideContext.db || db,
  );
  return getApp(context);
}

before(async () => {
  await runMigrations(config, logger);
});

module.exports = {
  getTestApp,
};
