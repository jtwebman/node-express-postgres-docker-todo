'use strict';

const express = require('express');
const { validateSignup } = require('../validation/signup');
const { signup } = require('../services/user');

function getAuthRouter(context) {
  const router = express.Router();

  router.post('/signup', express.json(), async (req, res, next) => {
    try {
      const errors = validateSignup(req.body);
      if (errors.length > 0) {
        return res.status(400).send({ errors });
      }
      const newUser = await signup(context, req.body);
      return res.json({ ...newUser, email: req.body.email, emailVerified: false, archivedAt: null, bannedAt: null });
    } catch (error) {
      if (error.message.includes('users_email_key')) {
        return res.status(400).send({
          errors: [
            {
              message: 'Email already exists in the system.',
              location: 'body',
              slug: 'signup-email-already-exists',
            },
          ],
        });
      }
      return next(error);
    }
  });

  return router;
}

module.exports = getAuthRouter;
