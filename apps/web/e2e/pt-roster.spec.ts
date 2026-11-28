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

    await page.route('**/notifications', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ notifications: [], unreadCount: 0 }),
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

  test('should display new pending student request in realtime via SSE without reloading', async ({ page }) => {
    let hasPendingRequest = false;
    const streamGate: { release?: () => void } = {};
    const streamConnectedPromise = new Promise<void>((resolve) => {
      streamGate.release = resolve;
    });

    await page.unroute('**/pt/dashboard**');
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
          pendingStudentRequests: hasPendingRequest
            ? [
                {
                  id: 'req-live-1',
                  studentId: 'student-live-1',
                  studentName: 'Lê Minh Tâm',
                  studentEmail: 'tam.le@example.com',
                  status: 'PENDING',
                  requestedAt: new Date().toISOString(),
                },
              ]
            : [],
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

    let streamPushCount = 0;
    await page.route('**/notifications/stream', async (route) => {
      streamPushCount += 1;
      if (streamPushCount === 1) {
        await streamConnectedPromise;
        const ssePayload = {
          event: 'notification',
          type: 'STUDENT_REQUEST',
          timestamp: new Date().toISOString(),
          notification: {
            id: 'notif-live-1',
            userId: 'mock-pt-1',
            title: 'Yêu Cầu Ghép Lớp 1:1 Mới',
            message: 'Lê Minh Tâm vừa gửi yêu cầu ghép lớp với bạn.',
            type: 'STUDENT_REQUEST',
            isRead: false,
            linkUrl: '/pt',
            createdAt: new Date().toISOString(),
          },
        };
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream; charset=utf-8',
          body: `event: connected\ndata: {}\n\nevent: notification\ndata: ${JSON.stringify(ssePayload)}\n\n`,
        });
        return;
      }

      await route.abort();
    });

    await page.goto('/pt');
    await expect(page.getByText('Học viên Nguyễn Văn A')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Lê Minh Tâm')).toHaveCount(0);

    // Simulate student scanning QR code on another device
    hasPendingRequest = true;
    streamGate.release?.();

    await expect(page.getByText('Lê Minh Tâm vừa gửi yêu cầu ghép lớp với bạn.')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('heading', { name: 'Lê Minh Tâm' })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole('button', { name: /Chấp nhận học viên/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test('should update student profile from pending to approved PT in realtime via SSE without reloading', async ({
    page,
  }) => {
    let isPtApproved = false;
    const streamGate: { release?: () => void } = {};
    const streamConnectedPromise = new Promise<void>((resolve) => {
      streamGate.release = resolve;
    });

    await page.unroute('**/users/me');
    await page.route('**/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'student-live-1',
          email: 'student.live@example.com',
          fullName: 'Lê Minh Tâm',
          role: 'USER',
          onboardingCompleted: true,
          assignedPt: {
            id: 'mock-pt-1',
            fullName: 'Coach Alexander',
            status: isPtApproved ? 'APPROVED' : 'PENDING',
            isApproved: isPtApproved,
            isPending: !isPtApproved,
          },
        }),
      });
    });

    await page.route('**/workout/assigned-workout-plan', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null),
      });
    });

    let streamPushCount = 0;
    await page.route('**/notifications/stream', async (route) => {
      streamPushCount += 1;
      if (streamPushCount === 1) {
        await streamConnectedPromise;
        const ssePayload = {
          event: 'notification',
          type: 'PT_ACCEPTED',
          timestamp: new Date().toISOString(),
          notification: {
            id: 'notif-student-accepted-1',
            userId: 'student-live-1',
            title: 'Huấn Luyện Viên Đã Phê Duyệt!',
            message: 'Coach Alexander đã chấp nhận yêu cầu ghép lớp 1:1.',
            type: 'PT_ACCEPTED',
            isRead: false,
            linkUrl: '/training',
            createdAt: new Date().toISOString(),
          },
        };
        await route.fulfill({
          status: 200,
          contentType: 'text/event-stream; charset=utf-8',
          body: `event: connected\ndata: {}\n\nevent: notification\ndata: ${JSON.stringify(ssePayload)}\n\n`,
        });
        return;
      }

      await route.abort();
    });

    await page.goto('/profile');
    await expect(page.getByText('Yêu Cầu Kết Nối Đang Chờ Duyệt')).toBeVisible({
      timeout: 15000,
    });

    // Simulate PT clicking Approve on another device
    isPtApproved = true;
    streamGate.release?.();

    await expect(
      page.getByText('Coach Alexander đã chấp nhận yêu cầu ghép lớp 1:1.'),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Huấn Luyện Viên PT Đồng Hành')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Đang hoạt động')).toBeVisible({
      timeout: 15000,
    });
  });
});
