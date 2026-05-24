/**
 * Example: TypeScript Test File (Expected Output)
 * The migrated TypeScript version of the test
 */

import { test, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }: { page: Page }): Promise<void> => {
    loginPage = new LoginPage(page);
  });

  test('should login successfully', async (): Promise<void> => {
    await loginPage.login('user@example.com', 'password123');
    await loginPage.expectSuccessMessage();
  });

  test('should display error on invalid credentials', async ({ page }: { page: Page }): Promise<void> => {
    await loginPage.navigate();
    await loginPage.fillEmail('invalid@example.com');
    await loginPage.fillPassword('wrong');
    await loginPage.clickLogin();
    const errorMsg = page.locator('.error-message');
    await expect(errorMsg).toBeVisible();
  });
});
