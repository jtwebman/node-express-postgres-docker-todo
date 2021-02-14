import express from 'express';

export function getStatusApp() : express.Application {
  const app = express();

  app.get('/status', (_req, res) => res.send('OK'));

  return app;
}
