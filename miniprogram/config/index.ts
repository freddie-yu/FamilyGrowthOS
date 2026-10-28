import { defineConfig } from '@tarojs/cli';
import path from 'node:path';
import { loadEnvironment } from '../../scripts/environment.cjs';
import type { PublicAppConfig } from '@family-growth/shared';

const config: PublicAppConfig = loadEnvironment(process.env.APP_ENV || 'dev');

export default defineConfig<'webpack5'>({
  projectName: 'FamilyGrowthOS',
  date: '2026-10-28',
  designWidth: 375,
  deviceRatio: { 375: 2, 640: 2.34 / 2, 750: 1, 828: 1.81 / 2 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: { type: 'webpack5', prebundle: { enable: false } },
  plugins: ['@tarojs/plugin-platform-weapp'],
  cache: { enable: false },
  defineConstants: {
    __FG_ENVIRONMENT__: JSON.stringify(config.environment),
    __FG_API_BASE_URL__: JSON.stringify(config.apiBaseUrl),
  },
  mini: {
    compile: {
      include: [path.resolve(__dirname, '../ui'), path.resolve(__dirname, '../../shared')],
    },
    postcss: {
      pxtransform: { enable: true, config: {} },
      cssModules: { enable: false },
    },
  },
});
