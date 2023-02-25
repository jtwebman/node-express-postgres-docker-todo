'use strict';

const { Queue } = require('bullmq');

function getWorkers(config) {
  const queues = {
    emails: new Queue('emails', {
      connection: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
    }),
  };

  return {
    sendEmail: (emailName, data) =>
      queues.emails.add(emailName, data, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: config.EMAIL_ATTEMPTS,
        backoff: {
          type: 'exponential',
          delay: config.EMAIL_ATTEMPTS_BACKOFF,
        },
      }),
    closeAll: () => {
      return Promise.all([queues.emails.close()]);
    },
  };
}

module.exports = {
  getWorkers,
};
