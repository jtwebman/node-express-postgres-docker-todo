'use strict';

const bcrypt = require('bcrypt');

const userData = require('../data/user');

async function signup(context, values) {
  const newBcryptPassword = await bcrypt.hash(values.password, context.config.BCRYPT_SALT_ROUNDS);
  const newUser = {
    email: values.email,
    password: newBcryptPassword,
  };
  return userData.insertUser(context.db, newUser);
}

module.exports = {
  signup,
};
