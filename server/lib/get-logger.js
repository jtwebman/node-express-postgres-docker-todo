'use strict';

const winston = require('winston');

const pjson = require('../../package.json');

/**
 * Gets a new winston logger client object
 * @param {Object} config node config object
 * @return {Object} a winston logger client
 */
function getLogger(config) {
  return winston.createLogger( {
    defaultMeta: {
      app: pjson.name,
      version: pjson.version
    },
    transports: [
      new winston.transports.Console({
        level: config.get('LOGGER_LEVEL'),
        format: winston.format.simple(),
        handleExceptions: true,
        handleRejections: true
      })
    ]
  });
}

module.exports = getLogger;
