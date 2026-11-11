import { chromium} from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const baseUrl = process.env.BASE_URL || 'https://en.wikipedia.org';
  if (!process.env.WIKI_USERNAME || !process.env.WIKI_PASSWORD) {
    throw new Error('WIKI_USERNAME/WIKI_PASSWORD are not set. Please create .env file in the project root.');
  }
  await page.goto(`${baseUrl}/w/index.php?title=Special:UserLogin`);
  await page.fill('#wpName1', process.env.WIKI_USERNAME);
  await page.fill('#wpPassword1', process.env.WIKI_PASSWORD);
  await Promise.all([
  page.waitForLoadState('domcontentloaded'),
  page.click('#wpLoginAttempt')
]);
  const loginFormStillVisible = await page.locator('#wpName1, #wpPassword1, #wpLoginAttempt').first().isVisible().catch(() => false);
  if (loginFormStillVisible) {
    throw new Error('Login form is still visible after submit. Login may have failed (wrong creds / captcha / blocked).');
  }
  await page.context().storageState({ path: 'auth/auth.json' });
  await browser.close();
}
export default globalSetup;