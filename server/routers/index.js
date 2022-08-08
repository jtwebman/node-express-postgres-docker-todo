'use strict';

const express = require('express');

function getIndexRouter() {
  const router = express.Router();

  router.get('/', (req, res) => res.send('Hello World!'));

  return router;
}

module.exports = getIndexRouter;
