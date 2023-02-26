'use strict';

const fs = require('fs');
const { join } = require('path');

const { generate } = require('./emails/generate');

async function writePreviewFile(name, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(join(__dirname, 'emails', 'previews', name), data, error => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

async function generatePrviews() {
  return Promise.all([
    writePreviewFile(
      'signup.html',
      await generate('signup', {
        confirmUrl: 'https://jtwebman.com',
      }),
    ),
  ]);
}

generatePrviews()
  .then(() => {
    console.log(`Previews generated ${join(__dirname, 'emails', 'previews')}`);
  })
  .catch(error => {
    console.log(`Error generating previews ${error}`);
  });
