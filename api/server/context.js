'use strict';

const { waitDBConnect } = require('./db/pg-client');

function getContext(config, logger, pgDB) {
  return waitDBConnect(pgDB).then(db => ({
    config,
    logger,
    db,
  }));
}

module.exports = {
  getContext,
};
