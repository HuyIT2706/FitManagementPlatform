import { test, expect } from '@playwright/test';

const createMockPtJwt = () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'mock-pt-1',
      exp: Math.floor(Date.now() / 1000) + 86400,
    }),
  ).toString('base64url');
  return `${header}.${payload}.mocksignature`;
};

test.describe('E2E - PT Coaching & Student Nutrition Assignment', () => {
  test.beforeEach(async ({ page }) => {
    const token = createMockPtJwt();
    await page.addInitScript((jwt) => {
      window.localStorage.setItem('jwt_token', jwt);
    }, token);

    // Mock user profile as approved PT role
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-pt-1',
          email: 'pt@example.com',
          fullName: 'Coach Alexander',
          role: 'PT',
          isApprovedPt: true,
          specialties: 'Hypertrophy, Fat Loss',
        }),
      });
    });

    await page.route('**/pt/dashboard**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          coachName: 'Coach Alexander',
          totalVipStudents: 2,
          todaySessionsCount: 1,
          completedSessionsCount: 0,
          totalPackageSessionsCount: 20,
          warningsCount: 0,
          pendingStudentRequests: [],
          todaySessions: [],
          students: [
            {
              id: 'student-1',
              fullName: 'Học viên Nguyễn Văn A',
              packageName: 'Gói PT 1-1 Hypertrophy',
              remainingSessions: 12,
              totalSessions: 20,
              avatarUrl: null,
            },
          ],
        }),
      });
    });
  });

  test('should render PT coaching view and student roster', async ({ page }) => {
    await page.goto('/pt');

    await expect(page.getByText('Danh sách học viên')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Học viên Nguyễn Văn A')).toBeVisible();
  });
});
