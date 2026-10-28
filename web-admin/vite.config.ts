import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import type { PublicAppConfig } from '@family-growth/shared';

const nodeRequire = createRequire(import.meta.url);
const { loadEnvironment } = nodeRequire(
  '../scripts/environment.cjs',
) as typeof import('../scripts/environment.cjs');
const config: PublicAppConfig = loadEnvironment(process.env.APP_ENV || 'dev');
export default defineConfig({
  plugins: [react()],
  // Disable automatic VITE_* injection. Expose only this explicit public contract.
  envPrefix: [],
  define: { __FG_CONFIG__: JSON.stringify(config) },
  server: { port: 5173, strictPort: true },
});
