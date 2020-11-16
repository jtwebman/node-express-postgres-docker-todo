'use strict';

const express = require('express');

const getIndexRouter = require('./routers/index');

/**
 * Gets the express app taking in the conext with globals like db, config, and emailer
 * @param {Object} context a context object with globals like config, db, redit, and emailer
 * @return {Object} the express app wired up
 */
function getApp(context) {
  const app = express();

  app.disable('x-powered-by');

  app.use('/', getIndexRouter(context));

  return app;
}

module.exports = getApp;
