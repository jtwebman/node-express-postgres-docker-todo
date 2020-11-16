'use strict';

const express = require('express');

/**
 * Gets a default index router
 * @param {Object} context object container config, db, etc...
 * @return {Object} the expres index router
 */
function getIndexRouter(context) {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.get('/', (_req, res) => res.send('Hello World!'));

  return router;
}

module.exports = getIndexRouter;
