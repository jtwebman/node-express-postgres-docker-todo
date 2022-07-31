'use strict';

module.exports = {
  PG_CONNECTION: process.env.PG_CONNECTION || 'postgres://todo-user:password123!@0.0.0.0:15432/test-todo',
  PG_MIGRATION_CONNECTION:
    process.env.PG_MIGRATION_CONNECTION || 'postgres://root-user:password123!@0.0.0.0:15432/postgres',
};
