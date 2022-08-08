'use strict';

const express = require('express');

function getStatusRouter(context) {
  const router = express.Router();

  router.get('/', (req, res) => res.send('OK'));

  return router;
}

module.exports = getStatusRouter;
