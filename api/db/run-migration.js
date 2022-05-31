'use strict';

const config = require('config');
const logger = require('../server/lib/logger');
const { runMigrations } = require('./migrate');

runMigrations(config, logger).catch(() => process.exit(-1));
