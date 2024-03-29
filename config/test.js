'use strict';

module.exports = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  PG_CONNECTION: 'postgres://todo-user:password123!@0.0.0.0:15432/test-todo',
  PG_MIGRATION_CONNECTION: 'postgres://root-user:password123!@0.0.0.0:15432/postgres',
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10,
  REDIS_HOST: '0.0.0.0',
  REDIS_PORT: '16379',
  EMAIL_ATTEMPTS: process.env.EMAIL_ATTEMPTS ? parseInt(process.env.EMAIL_ATTEMPTS, 10) : 10,
  EMAIL_ATTEMPTS_BACKOFF: process.env.EMAIL_ATTEMPTS_BACKOFF ? parseInt(process.env.EMAIL_ATTEMPTS_BACKOFF, 10) : 15000,
};
