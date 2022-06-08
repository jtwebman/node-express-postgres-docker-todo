'use strict';

const config = require('config');
const pino = require('pino');
const pjson = require('../package.json');

const options = {
  name: pjson.name,
  base: { version: pjson.version },
  level: config.LOG_LEVEL,
};

const transport = pino.transport({
  target: 'pino/file',
});

if (process.env.NODE_ENV === 'test') {
  options.enabled = process.env.SHOW_LOGS === '1';
}

const logger = pino(options, transport);

module.exports = {
  logger,
  transport,
  options,
};
