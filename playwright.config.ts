import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: './tests',

  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },

  globalSetup: './scripts/login.setup.ts',

  use: {
    baseURL: process.env.BASE_URL || 'https://en.wikipedia.org',
    storageState: 'auth/auth.json',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
});