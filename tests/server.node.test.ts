import request from 'supertest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createApp } from '../server/src/app';
import { loadServerConfig } from '../server/src/config';

test('local Express liveness never claims database readiness or leaks configuration', async () => {
  const result = await request(
    createApp({
      environment: 'dev',
      port: 0,
      cloudbaseEnvId: 'private',
      redisUrl: 'redis://secret:password@localhost',
    }),
  ).get('/healthz');
  expect(result.status).toBe(200);
  expect(result.body).toEqual({ status: 'ok', environment: 'dev' });
  expect(result.headers['x-powered-by']).toBeUndefined();
  expect((await request(createApp({ environment: 'dev', port: 0 })).get('/auth/me')).status).toBe(
    404,
  );
});

describe('server environment isolation', () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), 'fg-env-'));
  afterAll(() => rmSync(directory, { recursive: true, force: true }));
  test('loads only the selected local file and never mutates process.env', () => {
    const environmentHash = () =>
      createHash('sha256').update(JSON.stringify(process.env)).digest('hex');
    const before = environmentHash();
    for (const [index, environment] of ['dev', 'staging', 'prod'].entries()) {
      writeFileSync(
        path.join(directory, `.env.${environment}.local`),
        `PORT=${9000 + index}\nCLOUDBASE_ENV_ID=${environment}-private\nREDIS_URL=redis://localhost:6379/${index}\n`,
      );
    }
    for (const [index, environment] of ['dev', 'staging', 'prod'].entries()) {
      expect(loadServerConfig({ APP_ENV: environment }, directory)).toEqual({
        environment,
        port: 9000 + index,
        cloudbaseEnvId: `${environment}-private`,
        redisUrl: `redis://localhost:6379/${index}`,
      });
    }
    expect(environmentHash()).toBe(before);
    expect(loadServerConfig({ APP_ENV: 'prod', PORT: '8088' }, directory).port).toBe(8088);
  });
  test('validates configuration without echoing secrets', () => {
    expect(() => loadServerConfig({ APP_ENV: '../prod' }, directory)).toThrow('Invalid APP_ENV');
    expect(() => loadServerConfig({ PORT: 'bad', REDIS_URL: 'secret' }, directory)).toThrow(
      'Invalid server configuration',
    );
    expect(loadServerConfig({}, os.tmpdir())).toEqual({ environment: 'dev', port: 8080 });
    expect(loadServerConfig({ PORT: '0' })).toEqual({ environment: 'dev', port: 0 });
  });
});
