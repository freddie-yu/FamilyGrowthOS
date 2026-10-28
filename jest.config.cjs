const transform = {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: {
        target: 'ES2022',
        module: 'CommonJS',
        jsx: 'react-jsx',
        esModuleInterop: true,
        resolveJsonModule: true,
        strict: true,
      },
      diagnostics: true,
    },
  ],
};
module.exports = {
  collectCoverageFrom: [
    'server/src/{app,config}.ts',
    'miniprogram/ui/FGButton.tsx',
    'web-admin/src/ui/FGButton.tsx',
    'scripts/environment.cjs',
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } },
  projects: [
    {
      displayName: 'node',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/**/*.node.test.ts', '<rootDir>/tests/**/*.node.test.cjs'],
      transform,
    },
    {
      displayName: 'ui',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/tests/**/*.ui.test.tsx'],
      transform,
      setupFilesAfterEnv: ['<rootDir>/tests/support/setup.ts'],
      moduleNameMapper: {
        '^@tarojs/components$': '<rootDir>/tests/support/taro-components.tsx',
        '\\.(scss|css)$': '<rootDir>/tests/support/style.cjs',
      },
    },
  ],
};
