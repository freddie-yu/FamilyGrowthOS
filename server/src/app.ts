import express from 'express';
import type { ServerConfig } from './config';

export function createApp(config: ServerConfig) {
  const app = express();
  app.disable('x-powered-by');
  // Liveness only: this does not assert CloudBase/Redis readiness or implement a business API.
  app.get('/healthz', (_request, response) => {
    response.json({ status: 'ok', environment: config.environment });
  });
  return app;
}
