'use strict';

const express = require('express');
const morgan = require('morgan');

const indexRouter = require('./routers/index');
const statusRouter = require('./routers/status');
const getAuthRouter = require('./routers/auth');

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
  app.use('/auth', getAuthRouter(context));

  app.use((err, req, res, next) => {
    context.logger.error(`Unhandled error calling route ${req.method} ${req.originalUrl}`, {
      stack: err.stack,
      message: err.message,
    });

    res.status(500).json({ errors: [{ message: err.message, slug: 'unknown-error' }] });
  });

  return app;
}

module.exports = { getApp };
