/**
 * Example: TypeScript Page Object (Expected Output)
 * The migrated TypeScript version of LoginPage
 */

import { Page, expect } from '@playwright/test';

/**
 * LoginPage
 * Page object for login functionality
 */
export class LoginPage {
  constructor(private page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto('https://example.com/login');
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.fill('[data-testid="email"]', email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.fill('[data-testid="password"]', password);
  }

  async clickLogin(): Promise<void> {
    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string): Promise<void> {
    await this.navigate();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async expectSuccessMessage(): Promise<void> {
    const successMsg = this.page.locator('.success-message');
    await expect(successMsg).toBeVisible();
  }
}
