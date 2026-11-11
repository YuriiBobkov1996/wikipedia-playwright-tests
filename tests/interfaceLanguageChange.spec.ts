import { test, expect } from '@playwright/test';
import { PreferencesPage } from '../pages/PreferencesPage';

test('authorized user can change interface language to Ukrainian', async ({ page }) => {
  const preferences = new PreferencesPage(page);
  await preferences.open();
  await expect(page).not.toHaveURL(/Special:UserLogin/);
  await preferences.assertUserProfileTabIsActive();
  await preferences.ensureInterfaceLanguage('en');
  await preferences.setInterfaceLanguage('uk');
  await preferences.assertInterfaceLanguageIs('uk');
});