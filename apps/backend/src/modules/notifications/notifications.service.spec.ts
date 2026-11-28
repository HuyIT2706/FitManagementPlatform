import { NotificationsService } from './notifications.service';
import type { PrismaService } from '../../prisma/prisma.service';

describe('NotificationsService - Realtime SSE PubSub', () => {
  it('delivers persisted notifications immediately to connected user subscribers', async () => {
    const createdAt = new Date('2026-11-28T09:00:00.000Z');
    const prismaMock = {
      notification: {
        create: jest.fn().mockResolvedValue({
          id: 'notif-1',
          userId: 'pt-1',
          title: 'Yêu Cầu Ghép Lớp 1:1 Mới',
          message: 'Nguyễn Văn A vừa gửi yêu cầu ghép lớp với bạn.',
          type: 'STUDENT_REQUEST',
          isRead: false,
          linkUrl: '/pt',
          createdAt,
        }),
      },
      pushSubscription: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const service = new NotificationsService(
      prismaMock as unknown as PrismaService,
    );

    const ptEvents: unknown[] = [];
    const otherUserEvents: unknown[] = [];
    const unsubscribePt = service.subscribeStream('pt-1', (evt) =>
      ptEvents.push(evt),
    );
    const unsubscribeOther = service.subscribeStream('pt-2', (evt) =>
      otherUserEvents.push(evt),
    );

    const res = await service.sendNotification({
      userId: 'pt-1',
      title: 'Yêu Cầu Ghép Lớp 1:1 Mới',
      message: 'Nguyễn Văn A vừa gửi yêu cầu ghép lớp với bạn.',
      type: 'STUDENT_REQUEST',
      linkUrl: '/pt',
    });

    expect(res).toEqual({ success: true, notificationId: 'notif-1' });
    expect(ptEvents).toHaveLength(1);
    expect(otherUserEvents).toHaveLength(0);
    expect(ptEvents[0]).toMatchObject({
      event: 'notification',
      type: 'STUDENT_REQUEST',
      notification: {
        id: 'notif-1',
        userId: 'pt-1',
        title: 'Yêu Cầu Ghép Lớp 1:1 Mới',
        type: 'STUDENT_REQUEST',
        isRead: false,
        linkUrl: '/pt',
        createdAt: createdAt.toISOString(),
      },
    });

    unsubscribePt();
    unsubscribeOther();

    service.emitRealtimeEvent('pt-1', {
      event: 'sync',
      syncType: 'PT_REQUEST_UPDATED',
    });
    expect(ptEvents).toHaveLength(1);
  });
});
