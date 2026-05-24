/**
 * Example: Simple Page Object
 * A JavaScript page object for testing
 */

class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto('https://example.com/login');
  }

  async fillEmail(email) {
    await this.page.fill('[data-testid="email"]', email);
  }

  async fillPassword(password) {
    await this.page.fill('[data-testid="password"]', password);
  }

  async clickLogin() {
    await this.page.click('button[type="submit"]');
  }

  async login(email, password) {
    await this.navigate();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async expectSuccessMessage() {
    const successMsg = await this.page.locator('.success-message');
    expect(successMsg).toBeVisible();
  }
}

module.exports = LoginPage;
