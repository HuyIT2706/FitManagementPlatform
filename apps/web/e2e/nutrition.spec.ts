import { test, expect } from '@playwright/test';

const createMockJwt = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'mock-user-1',
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  ).toString('base64url');
  return `${header}.${payload}.mocksignature`;
};

test.describe('E2E - Nutrition & Meal Planner Journey', () => {
  test.beforeEach(async ({ page }) => {
    const token = createMockJwt();
    await page.addInitScript((jwt) => {
      window.localStorage.setItem('jwt_token', jwt);
    }, token);

    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-user-1',
          email: 'user@example.com',
          fullName: 'Nguyễn Văn A',
          role: 'USER',
          onboardingCompleted: true,
          tdee: 2200,
          nutritionTargets: [
            {
              targetCalo: 2000,
              targetProtein: 150,
              targetCarbs: 200,
              targetFat: 60,
            },
          ],
        }),
      });
    });

    await page.route('**/nutrition/daily**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          targets: { calories: 2000, protein: 150, carbs: 200, fat: 60 },
          consumed: { calories: 1200, protein: 95, carbs: 110, fat: 32 },
          progress: { caloriesPercent: 60, proteinPercent: 63, carbsPercent: 55, fatPercent: 53 },
          meals: [],
        }),
      });
    });

    await page.route('**/nutrition/foods**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'food-1',
              name: 'Ức gà áp chảo',
              caloriesPer100g: 130,
              proteinPer100g: 28,
              carbsPer100g: 0,
              fatPer100g: 2,
            },
          ],
          total: 1,
          page: 1,
          limit: 8,
          totalPages: 1,
        }),
      });
    });
  });

  test('should display nutrition overview and macro targets on home page', async ({ page }) => {
    await page.goto('/home');

    // Macro cards show Đạm (Protein) and Tinh bột (Carbs)
    await expect(page.getByText('Đạm (Protein)')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Tinh bột (Carbs)')).toBeVisible();
  });

  test('should navigate to add-meal screen and render food search or smart input', async ({ page }) => {
    await page.goto('/add-meal');

    const inputElement = page.locator('input, textarea').first();
    await expect(inputElement).toBeVisible({ timeout: 15000 });
  });
});
