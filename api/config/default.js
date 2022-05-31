'use strict';

module.exports = {
  PORT: process.env.PORT || 3000,
  STATUS_PORT: process.env.STATUS_PORT || 2368,
  LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'info',
  PG_CONNECTION: process.env.PG_CONNECTION || 'postgres://todo-user:password123!@localhost:15432/dev-todo',
  PG_MIGRATION_CONNECTION:
    process.env.PG_MIGRATION_CONNECTION || 'postgres://root-user:password123!@localhost:15432/postgres',
};
