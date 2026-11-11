import { test } from '../fixtures/test';

test('authorized user can change interface language to Ukrainian', async ({ preferencesPage }) => {
  await preferencesPage.setInterfaceLanguage('uk');
  await preferencesPage.assertInterfaceLanguageIs('uk');
});
