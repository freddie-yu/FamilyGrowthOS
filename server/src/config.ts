import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'dotenv';
import Joi from 'joi';
import type { AppEnvironment } from '@family-growth/shared';

export interface ServerConfig {
  environment: AppEnvironment;
  port: number;
  cloudbaseEnvId?: string;
  redisUrl?: string;
}

export function loadServerConfig(
  input: NodeJS.ProcessEnv = process.env,
  directory = process.cwd(),
): ServerConfig {
  const environment = input.APP_ENV || 'dev';
  if (!['dev', 'staging', 'prod'].includes(environment)) throw new Error('Invalid APP_ENV');
  const localPath = path.join(directory, `.env.${environment}.local`);
  const local = existsSync(localPath) ? parse(readFileSync(localPath)) : {};
  const { value, error } = Joi.object({
    APP_ENV: Joi.string().valid('dev', 'staging', 'prod').required(),
    PORT: Joi.number().port().default(8080),
    CLOUDBASE_ENV_ID: Joi.string().optional(),
    REDIS_URL: Joi.string()
      .uri({ scheme: ['redis', 'rediss'] })
      .optional(),
  })
    .unknown(true)
    .validate({ ...local, ...input, APP_ENV: environment });
  // Configuration errors must never print credentials or the input object.
  if (error) throw new Error('Invalid server configuration');
  return {
    environment: value.APP_ENV,
    port: value.PORT,
    cloudbaseEnvId: value.CLOUDBASE_ENV_ID,
    redisUrl: value.REDIS_URL,
  };
}
