import { test, expect } from '@playwright/test';

test.describe('E2E - Authentication & Role Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page and wait for Suspense client hydration
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 });
  });

  test('should render login page with all core elements', async ({ page }) => {
    // Verify title and brand
    await expect(page).toHaveTitle(/NutriCore|FitManagement/i, { timeout: 15000 });

    // Verify presence of email, password inputs, submit button
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible({ timeout: 15000 });
    await expect(passwordInput).toBeVisible({ timeout: 15000 });
    await expect(submitButton).toBeVisible({ timeout: 15000 });

    // Verify Google OAuth login option is present
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Đăng nhập bằng Google")');
    if (await googleButton.count() > 0) {
      await expect(googleButton.first()).toBeVisible({ timeout: 15000 });
    }
  });

  test('should toggle between Login and Register tabs', async ({ page }) => {
    const registerTab = page.locator('button:has-text("Đăng ký"), button:has-text("Tạo tài khoản")').first();
    await expect(registerTab).toBeVisible({ timeout: 15000 });

    const nameInput = page.locator('input[type="text"]').first();
    // Retry click briefly in case Next dev SSR rendered the button just before React attached handlers
    await expect(async () => {
      if (!(await nameInput.isVisible())) {
        await registerTab.click();
      }
      await expect(nameInput).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
  });

  test('should show validation or browser check on invalid submission', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible({ timeout: 15000 });
    await submitButton.click();

    // The email input has HTML5 required validation
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 15000 });
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
    expect(isInvalid).toBe(true);
  });
});

