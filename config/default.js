'use strict';

module.exports = {
  PORT: process.env.PORT || 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PG_CONNECTION: process.env.PG_CONNECTION,
  PG_MIGRATION_CONNECTION: process.env.PG_MIGRATION_CONNECTION,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 10,
};
