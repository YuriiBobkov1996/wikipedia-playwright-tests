import { test as base } from '@playwright/test';
import { PreferencesPage } from '../pages/PreferencesPage';

type Fixtures = {
  preferencesPage: PreferencesPage;
};

export const test = base.extend<Fixtures>({
  preferencesPage: async ({ page }, use) => {
    const preferencesPage = new PreferencesPage(page);
    await preferencesPage.open();
    const originalLanguage = await preferencesPage.getCurrentLangCode();

    try {
      await preferencesPage.assertUserProfileTabIsActive();
      await preferencesPage.ensureInterfaceLanguage('en');
      await preferencesPage.assertInterfaceLanguageIs('en');

      await use(preferencesPage);
    } finally {
      await preferencesPage.open();
      await preferencesPage.ensureInterfaceLanguage(originalLanguage);
    }
  },
});

export { expect } from '@playwright/test';
