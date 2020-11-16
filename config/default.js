'use strict';

module.exports = {
  PORT: process.env.PORT || 3000,
  STATUS_PORT: 2368,
  DB_CONNECTION: process.env.DB_CONNECTION || 'postgres://todo-user:password123!@db:5432/todo',
  LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'info'
};
