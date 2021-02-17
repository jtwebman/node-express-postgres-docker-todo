import express from 'express';

import { Context } from './context';
import { getUsersRouter } from './routers/users';

export function getApp(context: Context): express.Application {
  const app = express();

  app.disable('x-powered-by');

  app.use('/api/v1/users', getUsersRouter(context));

  return app;
}
