'use strict';

const { Worker } = require('bullmq');
const { emails } = require('./actions');

function startWork(context) {
  const emailWorker = new Worker('emails', emails.process(context), {
    connection: {
      host: context.config.REDIS_HOST,
      port: context.config.REDIS_PORT,
    },
  });

  return {
    workers: {
      emailWorker,
    },
    closeAll: (force = false) => {
      return Promise.all([emailWorker.close(force)]);
    },
  };
}

module.exports = {
  startWork,
};
