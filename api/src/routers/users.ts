import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { Context } from '../context';
import { create } from '../app/user';

export function getUsersRouter(context: Context): express.Router {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.post('/', async (req, res) => {
    const results = await create(context.db, req.body);
    if (results.errors) {
      return res.status(StatusCodes.BAD_REQUEST).send(results.errors);
    }
    return res.status(StatusCodes.OK).send(results.data);
  });

  return router;
}
