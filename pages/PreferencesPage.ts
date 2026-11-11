import { expect, Locator, Page } from '@playwright/test';
import { URLs } from './constants/urls';

export class PreferencesPage {
  readonly page: Page;
  readonly languageField: Locator;   
  readonly languageSelect: Locator;
  readonly saveButton: Locator;
  readonly userProfileTabSelected: Locator;

  constructor(page: Page) {
    this.page = page;

    this.languageField = page.locator('#mw-input-wplanguage');
    this.languageSelect = page.locator('select[name="wplanguage"]');
    this.saveButton = page.locator('#preferences button[type="submit"]');
    this.userProfileTabSelected = page.getByRole('tab', {
      name: /User profile|Профіль користувача/i,
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
    if (await this.userProfileTabSelected.count()) {
      await expect(this.userProfileTabSelected).toBeVisible();
    }
  }

  async getCurrentLangCode(): Promise<string> {
    // value у select: 'en', 'uk', ...
    return await this.languageSelect.inputValue();
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();

    await Promise.all([
      this.page.waitForLoadState('domcontentloaded'),
      this.saveButton.click(),
    ]);
    await expect(this.languageField).toBeVisible();
    await expect(this.languageSelect).toHaveCount(1);
  }

  async setInterfaceLanguage(langCode: 'en' | 'uk'): Promise<void> {
    await expect(this.languageSelect).toHaveCount(1);
    await this.languageSelect.selectOption(langCode, { force: true });
    await this.save();
    await expect(this.page.locator('html')).toHaveAttribute(
      'lang',
      new RegExp(`^${langCode}(-|$)`, 'i')
    );
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