'use strict';
const config = require('config');

const { getApp } = require('../server/app');
const { getContext } = require('../server/context');
const { getDB } = require('../server/db/pg-client');
const { logger } = require('../server/logger');

const db = getDB(config.PG_CONNECTION);

async function getTestApp(overrideContext) {
  const context = getContext(config, logger, db);
  return getApp({ ...context, ...overrideContext });
}

module.exports = {
  getTestApp,
};
