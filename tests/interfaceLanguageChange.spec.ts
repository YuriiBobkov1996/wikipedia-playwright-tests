import { test } from '../fixtures/test';

test('authorized user can change interface language to Ukrainian', async ({ preferencesPage, page }) => {
  await preferencesPage.setInterfaceLanguage('uk');
  await preferencesPage.assertInterfaceLanguageIs('uk');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await preferencesPage.assertInterfaceLanguageIs('uk');
});
