import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import { AUTH_FILE } from './config/auth';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',

  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },

  use: {
    baseURL: process.env.BASE_URL || 'https://en.wikipedia.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts$/,
      use: {
        browserName: 'chromium',
        trace: 'off',
        video: 'off',
      },
    },
    {
      name: 'chromium',
      testMatch: '**/*.spec.ts',
      dependencies: ['setup'],
      use: {
        browserName: 'chromium',
        storageState: AUTH_FILE,
      },
    },
  ],
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
