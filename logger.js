'use strict';

const config = require('config');
const winston = require('winston');
const pjson = require('./package.json');

let winstonFormat = winston.format.json();
const metaData = {
  app: pjson.name,
  version: pjson.version,
  time: new Date().toISOString(),
};

if (process.env.NODE_ENV !== 'production') {
  winstonFormat = winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize(),
  );
}

const logger = winston.createLogger({
  defaultMeta: metaData,
  transports: [
    new winston.transports.Console({
      level: config.loggerLevel,
      format: winstonFormat,
      handleExceptions: true,
      silent: process.env.NODE_ENV === 'test' && !process.env.SHOW_LOGS,
    }),
  ],
});

module.exports = { logger };
