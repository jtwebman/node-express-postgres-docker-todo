import express from 'express';
import bodyParser from 'body-parser';

import { Context } from './context';
import { getUsersRouter } from './routers/user';

export function getApp(context: Context): express.Application {
  const app = express();

  app.disable('x-powered-by');

  app.use(bodyParser.json());

  app.use('/api/v1/users', getUsersRouter(context));

  return app;
}
