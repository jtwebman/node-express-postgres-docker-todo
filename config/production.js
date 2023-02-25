'use strict';

module.exports = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PG_CONNECTION: process.env.PG_CONNECTION,
  PG_MIGRATION_CONNECTION: process.env.PG_MIGRATION_CONNECTION,
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  EMAIL_ATTEMPTS: process.env.EMAIL_ATTEMPTS ? parseInt(process.env.EMAIL_ATTEMPTS, 10) : 10,
  EMAIL_ATTEMPTS_BACKOFF: process.env.EMAIL_ATTEMPTS_BACKOFF ? parseInt(process.env.EMAIL_ATTEMPTS_BACKOFF, 10) : 15000,
};
