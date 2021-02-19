export default {
  PORT: process.env.PORT || 3000,
  STATUS_PORT: 2368,
  DB_CONNECTION: process.env.DB_CONNECTION || 'postgres://todo-user:password123!@db:5432/todo',
  LOGGER_LEVEL: process.env.LOGGER_LEVEL || 'info',
  PASSWORD_SALT_ROUNDS: process.env.PASSWORD_SALT_ROUNDS
    ? parseInt(process.env.PASSWORD_SALT_ROUNDS, 10)
    : undefined || 10,
};
