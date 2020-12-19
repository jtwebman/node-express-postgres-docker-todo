'use strict';

const winston = require('winston');

const pjson = require('../../package.json');

let winstonFormat = winston.format.json();
let metaData = {
  app: pjson.name,
  version: pjson.version,
  time: new Date().toISOString()
};

if (process.env.NODE_ENV != 'production') {
  winstonFormat = winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize()
  );
  metaData = {
    time: new Date().toISOString()
  };
}

/**
 * Gets a new winston logger client object
 * @param {Object} config node config object
 * @return {Object} a winston logger client
 */
function getLogger(config) {
  return winston.createLogger({
    defaultMeta: metaData,
    transports: [
      new winston.transports.Console({
        level: config.get('LOGGER_LEVEL'),
        format: winstonFormat,
        handleExceptions: true,
        handleRejections: true
      })
    ]
  });
}

module.exports = getLogger;
