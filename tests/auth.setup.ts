import { test as setup, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import * as path from 'node:path';
import { AUTH_FILE } from '../config/auth';

setup('authenticate Wikipedia user', async ({ page }) => {
  const username = process.env.WIKI_USERNAME;
  const password = process.env.WIKI_PASSWORD;

  if (!username || !password) {
    throw new Error('WIKI_USERNAME and WIKI_PASSWORD must be set in .env');
  }

  await page.goto('/w/index.php?title=Special:UserLogin');

  await page.locator('#wpName1').fill(username);
  await page.locator('#wpPassword1').fill(password);
  await page.locator('#wpLoginAttempt').click();

  // page.request shares cookies with this page's browser context.
  await expect.poll(
    async () => {
      const response = await page.request.get('/w/api.php', {
        params: {
          action: 'query',
          meta: 'userinfo',
          format: 'json',
        },
        timeout: 10_000,
      });

      expect(response.ok(), `Wikipedia userinfo returned HTTP ${response.status()}`).toBeTruthy();

      const data = await response.json();
      expect(data.error, 'Wikipedia userinfo API returned an error').toBeUndefined();
      return Number(data.query?.userinfo?.id ?? 0);
    },
    {
      timeout: 30_000,
      intervals: [1000, 2000],
      message: 'Wikipedia login was not confirmed. Check credentials and whether CAPTCHA or email verification is required.',
    }
  ).toBeGreaterThan(0);

  await mkdir(path.dirname(AUTH_FILE), { recursive: true });

  await page.context().storageState({
    path: AUTH_FILE,
  });
});
