import express from 'express';

import { Context } from '../context';
import { create } from '../app/user';
import { handleResult } from './router';

export function getUsersRouter(context: Context): express.Router {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.post('/', async (req, res) => {
    handleResult(res, await create(context, req.body));
  });

  return router;
}
