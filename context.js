'use strict';

const { waitDBConnect } = require('./data/db-client');

function getContext(config, logger, pgDb, workers) {
  return waitDBConnect(pgDb).then(db => ({
    config,
    logger,
    db,
    workers,
  }));
}

module.exports = {
  getContext,
};
