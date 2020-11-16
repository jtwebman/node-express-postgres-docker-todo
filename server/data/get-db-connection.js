'use strict';

const pgp = require('./pgp');

/**
 * Get the PG-Promise pool object. Should only have one pure service.
 * @param {Object} config the node config object
 * @return {Object} the pg-promise pool object
 */
function getDBConnection(config) {
  return pgp(config.get('DB_CONNECTION'));
}

module.exports = getDBConnection;
