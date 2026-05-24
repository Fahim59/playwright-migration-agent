/**
 * Example: Simple Test File
 * A JavaScript test for migration testing
 */

const { test, expect } = require('@playwright/test');
const LoginPage = require('../pages/LoginPage');

test.describe('Login Tests', () => {
  let page;
  let loginPage;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    loginPage = new LoginPage(page);
  });

  test('should login successfully', async () => {
    await loginPage.login('user@example.com', 'password123');
    await loginPage.expectSuccessMessage();
  });

  test('should display error on invalid credentials', async () => {
    await loginPage.navigate();
    await loginPage.fillEmail('invalid@example.com');
    await loginPage.fillPassword('wrong');
    await loginPage.clickLogin();
    const errorMsg = await page.locator('.error-message');
    expect(errorMsg).toBeVisible();
  });
});
