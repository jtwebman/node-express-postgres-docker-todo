'use strict';

const express = require('express');
const morgan = require('morgan');

const indexRouter = require('./routers/index');
const statusRouter = require('./routers/status');
const apiRouter = require('./routers/api');

function getApp(context) {
  const app = express();

  app.disable('x-powered-by');
  app.set('etag', false);

  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: data => {
          context.logger.info(data);
        },
      },
      skip: req => {
        if (req.baseUrl === '/status') {
          return true;
        }
        return false;
      },
    }),
  );

  app.use('/', indexRouter(context));
  app.use('/status', statusRouter(context));
  app.use('/api', apiRouter(context));

  return app;
}

module.exports = { getApp };
