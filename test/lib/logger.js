'use strict';

function getFakeLogger() {
  const logs = [];
  function getLogFunction(level) {
    return (message, value) => {
      logs.push({
        level,
        message,
        value,
      });
    };
  }

  return {
    info: getLogFunction('info'),
    warn: getLogFunction('warn'),
    error: getLogFunction('error'),
    debug: getLogFunction('debug'),
    getLogs: () => logs,
  };
}

function messageExists(logger, message) {
  const logs = logger.getLogs();
  const length = logs.length;
  for (let i = 0; i < length; i++) {
    if (logs[i].message === message) {
      return true;
    }
  }
  return false;
}

module.exports = {
  getFakeLogger,
  messageExists,
};
