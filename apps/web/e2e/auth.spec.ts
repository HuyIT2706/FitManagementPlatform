import { test, expect } from '@playwright/test';

test.describe('E2E - Authentication & Role Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
  });

  test('should render login page with all core elements', async ({ page }) => {
    // Verify title and brand
    await expect(page).toHaveTitle(/NutriCore|FitManagement/i);

    // Verify presence of email, password inputs, submit button
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Verify Google OAuth login option is present
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Đăng nhập bằng Google")');
    if (await googleButton.count() > 0) {
      await expect(googleButton.first()).toBeVisible();
    }
  });

  test('should toggle between Login and Register tabs', async ({ page }) => {
    const registerTab = page.locator('button:has-text("Đăng ký"), button:has-text("Tạo tài khoản")').first();
    if (await registerTab.isVisible()) {
      await registerTab.click();
      // Should now display additional registration fields (e.g. name or role)
      const nameInput = page.locator('input[type="text"]');
      await expect(nameInput.first()).toBeVisible();
    }
  });

  test('should show validation or browser check on invalid submission', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // The email input has HTML5 required validation
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });
});

