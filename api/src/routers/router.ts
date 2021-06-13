import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { some } from 'lodash';

import { AppErrorTypes, Result } from '../result';

export function handleResult<T>(res: Response, results: Result<T>): void {
  if (results.errors) {
    if (some(results.errors, (error) => error.type === AppErrorTypes.server)) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(results.errors);
      return;
    }
    if (some(results.errors, (error) => error.type === AppErrorTypes.access)) {
      res.status(StatusCodes.FORBIDDEN).send(results.errors);
      return;
    }
    if (some(results.errors, (error) => error.type === AppErrorTypes.notFound)) {
      res.status(StatusCodes.NOT_FOUND).send(results.errors);
      return;
    }
    res.status(StatusCodes.BAD_REQUEST).send(results.errors);
    return;
  }
  res.status(StatusCodes.OK).send(results.data);
}
