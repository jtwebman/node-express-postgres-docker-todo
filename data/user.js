'use strict';

const { pick } = require('lodash');

const { pgp } = require('./db-client');

const insertSupportedColumns = ['email', 'password'];

function insertUser(conn, user) {
  const newUserData = pick(user, insertSupportedColumns);
  const insertStatement = `${pgp.helpers.insert(
    newUserData,
    Object.keys(newUserData),
    'users',
  )} RETURNING id, created_at as "createAt", updated_at as "updatedAt"`;
  return conn.one(insertStatement).catch(error => {
    throw new Error(`Failed inserting user with data ${JSON.stringify(user)}: ${error.stack}`);
  });
}

module.exports = {
  insertUser,
};
