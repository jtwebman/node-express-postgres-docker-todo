'use strict';

const express = require('express');
// const bodyParser = require('body-parser');

function getApiRouter(context) {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.get('/', (req, res) => res.send('Hello World!'));

  return router;
}

module.exports = getApiRouter;
