'use strict';

const express = require('express');

/**
 * Get the status express app. This keeps docker status as a different app then the main node app.
 * @param {Object} context a context object with globals like config, db, redit, and emailer
 * @return {Object} status express app
 */
function getStatusApp(context) {
  const app = express();

  app.get('/status', (req, res) => res.send('OK'));

  return app;
}

module.exports = getStatusApp;
