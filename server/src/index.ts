import { createApp } from './app';
import { loadServerConfig } from './config';

const config = loadServerConfig();
const server = createApp(config).listen(config.port, '0.0.0.0', () => {
  console.info(`FamilyGrowthOS server listening on ${config.port} (${config.environment})`);
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
