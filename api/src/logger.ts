import winston from 'winston';

import { Config } from './config';

import pjson from '../package.json';

let winstonFormat = winston.format.json();
const metaData = {
  app: pjson.name,
  version: pjson.version,
  time: new Date().toISOString(),
};

if (process.env.NODE_ENV != 'production') {
  winstonFormat = winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize()
  );
}

export type Logger = winston.Logger;

export function getLogger(config: Config): Logger {
  return winston.createLogger({
    defaultMeta: metaData,
    transports: [
      new winston.transports.Console({
        level: config.get('LOGGER_LEVEL'),
        format: winstonFormat,
        handleExceptions: true,
        silent: process.env.NODE_ENV === 'test',
      }),
    ],
  });
}
