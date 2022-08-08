'use strict';

const upperCaseRegEx = new RegExp('[A-Z]');
const lowerCaseRegex = new RegExp('[a-z]');
const numberRegex = new RegExp('[0-9]');

function validateSignup(body) {
  const errors = [];

  if (!body.email) {
    errors.push({ message: 'Email is required', location: 'body', slug: 'signup-email-is-requied' });
  }
  if (!body.password) {
    errors.push({ message: 'Password is required', location: 'body', slug: 'signup-password-is-requied' });
  } else {
    if (body.password.length < 8) {
      errors.push({
        message: 'Password must be at least 8 characters',
        location: 'body',
        slug: 'signup-password-min-length-8',
      });
    }
    if (!upperCaseRegEx.test(body.password)) {
      errors.push({
        message: 'Password must have at least one upper case character',
        location: 'body',
        slug: 'signup-password-at-least-one-uppercase-character',
      });
    }
    if (!lowerCaseRegex.test(body.password)) {
      errors.push({
        message: 'Password must have at least one lower case character',
        location: 'body',
        slug: 'signup-password-at-least-one-lowercase-character',
      });
    }
    if (!numberRegex.test(body.password)) {
      errors.push({
        message: 'Password must have at least one number character',
        location: 'body',
        slug: 'signup-password-at-least-one-number-character',
      });
    }
  }

  return errors;
}

module.exports = {
  validateSignup,
};
