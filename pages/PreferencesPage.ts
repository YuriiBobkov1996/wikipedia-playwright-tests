import { expect, Locator, Page } from '@playwright/test';
import { URLs } from './constants/urls';

export class PreferencesPage {
  readonly page: Page;
  readonly languageField: Locator;
  readonly languageSelect: Locator;
  readonly languageOptions: Locator;
  readonly saveButton: Locator;
  readonly userProfileTabSelected: Locator;

  constructor(page: Page) {
    this.page = page;

    const languageWidget = page.locator('.mw-widgets-languageSelectWidget-vue-container');
    this.languageField = languageWidget.getByRole('combobox');
    this.languageSelect = page.locator('select[name="wplanguage"]');
    this.languageOptions = languageWidget.getByRole('option');
    this.saveButton = page.locator('#preferences button[type="submit"]');
    this.userProfileTabSelected = page.getByRole('tab', {
      name: /^(User profile|Особові дані|Профіль користувача)$/i,
      selected: true,
    });
  }

  async open(): Promise<void> {
    await this.page.goto(URLs.preferences, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/Special:Preferences/i);
    await expect(this.languageField).toBeVisible();
    await expect(this.languageSelect).toHaveCount(1);
  }

  async assertUserProfileTabIsActive(): Promise<void> {
    await expect(this.userProfileTabSelected).toBeVisible();
  }

  async getCurrentLangCode(): Promise<string> {
    return await this.languageSelect.inputValue();
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();

    await Promise.all([
      this.page.waitForResponse((response) =>
        response.request().isNavigationRequest() && response.request().method() === 'POST'
      ),
      this.saveButton.click(),
    ]);
    await expect(this.languageField).toBeVisible();
    await expect(this.languageSelect).toHaveCount(1);
    await expect(this.saveButton).toBeDisabled();
  }

  async setInterfaceLanguage(langCode: 'en' | 'uk'): Promise<void> {
    await this.languageField.fill(langCode);
    await this.languageOptions.filter({ hasText: new RegExp(`^${langCode}\\s*·`) }).click();
    await expect(this.languageSelect).toHaveValue(langCode);
    await this.save();
    await this.assertInterfaceLanguageIs(langCode);
  }

  async ensureInterfaceLanguage(langCode: 'en' | 'uk'): Promise<void> {
    const current = await this.getCurrentLangCode();
    if (current === langCode) return;
    await this.setInterfaceLanguage(langCode);
  }

  async assertInterfaceLanguageIs(lang: 'en' | 'uk'): Promise<void> {
    await expect(this.page.locator('html')).toHaveAttribute(
      'lang',
      new RegExp(`^${lang}(-|$)`, 'i')
    );
  }
}
