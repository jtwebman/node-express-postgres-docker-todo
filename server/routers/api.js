'use strict';

const express = require('express');

function getApiRouter(context) {
  const router = express.Router();

  router.get('/', (req, res) => res.send('Hello World!'));

  return router;
}

module.exports = getApiRouter;
