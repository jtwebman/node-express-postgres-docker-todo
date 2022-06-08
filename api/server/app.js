'use strict';

const express = require('express');
const pinoHttp = require('pino-http');

const { options } = require('./logger');
const indexRouter = require('./routers/index');
const statusRouter = require('./routers/status');

function getApp(context) {
  pinoHttp.logger = context.logger;
  const app = express();

  app.disable('x-powered-by');
  app.set('etag', false);
  app.use(
    pinoHttp({
      ...options,
      logger: context.logger,
    }),
  );

  app.use('/', indexRouter);
  app.get('/status', statusRouter);

  return app;
}

module.exports = { getApp };
