import { expect, Locator, Page } from '@playwright/test';
import { URLs } from './constants/urls';

export class PreferencesPage {
  readonly page: Page;
  readonly languageField: Locator;
  readonly languageSelect: Locator;
  readonly languageOptions: Locator;
  readonly saveButton: Locator;
  readonly selectedTab: Locator;
  readonly userProfilePanel: Locator;

  constructor(page: Page) {
    this.page = page;

    const languageWidget = page.locator('.mw-widgets-languageSelectWidget-vue-container');
    this.languageField = languageWidget.getByRole('combobox');
    this.languageSelect = page.locator('select[name="wplanguage"]');
    this.languageOptions = languageWidget.getByRole('option');
    this.saveButton = page.locator('#preferences button[type="submit"]');
    this.selectedTab = page.getByRole('tab', { selected: true });
    this.userProfilePanel = page.getByRole('tabpanel').filter({
      has: this.languageSelect,
    });
  }

  async open(): Promise<void> {
    await this.page.goto(URLs.preferences, { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/Special:Preferences/i);
    await expect(this.languageField).toBeVisible();
    await expect(this.languageSelect).toHaveCount(1);
  }

  async assertUserProfileTabIsActive(): Promise<void> {
    await expect(this.userProfilePanel).toBeVisible();
    const panelId = await this.userProfilePanel.getAttribute('id');
    if (!panelId) {
      throw new Error('User profile panel must have an id linked to its tab');
    }
    await expect(this.selectedTab).toBeVisible();
    await expect(this.selectedTab).toHaveAttribute('aria-controls', panelId);
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

  async setInterfaceLanguage(langCode: string): Promise<void> {
    await expect(this.languageField).not.toHaveValue('');
    await this.languageField.focus();
    await this.languageField.fill('');
    await this.languageField.pressSequentially(langCode);

    const escapedCode = langCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const languagePattern = new RegExp(`^${escapedCode}\\s*·`, 'i');
    const totalLanguages = await this.languageSelect.locator('option').count();
    // Wait for the debounced search to replace the initial, unfiltered menu.
    await expect(this.languageOptions).not.toHaveCount(totalLanguages);
    await expect(this.languageOptions.first()).toHaveText(languagePattern);
    await this.languageField.press('ArrowDown');
    await this.languageField.press('Enter');
    await expect(this.languageSelect).toHaveValue(langCode);
    await this.save();
    await expect(this.languageSelect).toHaveValue(langCode);
  }

  async ensureInterfaceLanguage(langCode: string): Promise<void> {
    const current = await this.getCurrentLangCode();
    if (current === langCode) return;
    await this.setInterfaceLanguage(langCode);
  }

  async assertInterfaceLanguageIs(lang: 'en' | 'uk'): Promise<void> {
    const saveButtonLabels = { en: 'Save', uk: 'Зберегти' };

    await expect(this.page.locator('html')).toHaveAttribute(
      'lang',
      new RegExp(`^${lang}(-|$)`, 'i')
    );
    await expect(this.languageSelect).toHaveValue(lang);
    await expect(this.saveButton).toHaveAccessibleName(saveButtonLabels[lang]);
  }
}
