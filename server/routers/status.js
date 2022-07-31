'use strict';

const express = require('express');

function getStatusRouter(context) {
  // eslint-disable-next-line new-cap
  const router = express.Router();

  router.get('/', (req, res) => res.send('OK'));

  return router;
}

module.exports = getStatusRouter;
