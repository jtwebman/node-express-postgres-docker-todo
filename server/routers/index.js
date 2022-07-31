'use strict';

const express = require('express');

function getIndexRouter() {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.get('/', (req, res) => res.send('Hello World!'));

  return router;
}

module.exports = getIndexRouter;
