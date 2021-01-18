'use strict';

const config = require('config');
const http = require('http');

const options = {
  host: '127.0.0.1',
  port: config.get('STATUS_PORT'),
  path: '/status',
  timeout: 2000,
};

const request = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', function(err) {
  console.log('ERROR');
  process.exit(1);
});

request.end();
