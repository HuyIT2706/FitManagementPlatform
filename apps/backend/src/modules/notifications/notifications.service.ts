import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as webpush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';
import { randomUUID } from 'crypto';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string | null;
  createdAt: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  // VAPID Keys for Web Push Notifications
  public readonly vapidPublicKey =
    'BJznxhmzusTKjOPidEXnMdtFyES4cU8i00t9ZwGBJk1UZizbIByNIrVxZggR72LRzbm3JYfsYt907OzFfoRLR2I';
  private readonly vapidPrivateKey = 'iTdcAwDueONNxBd6yF4wYswGSX5QfiG9tjUI--hmEL8';
  private readonly vapidSubject = 'mailto:support@nutricore.vn';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // 1. Initialize web-push VAPID details
    webpush.setVapidDetails(
      this.vapidSubject,
      this.vapidPublicKey,
      this.vapidPrivateKey,
    );

    // 2. Ensure database tables exist
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'INFO',
          is_read BOOLEAN DEFAULT FALSE,
          link_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS push_subscriptions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          endpoint TEXT UNIQUE NOT NULL,
          p256dh TEXT NOT NULL,
          auth TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
      `);

      this.logger.log('Notifications and PushSubscriptions tables verified.');
    } catch (err) {
      this.logger.error('Error creating notification tables:', err);
    }
  }

  // ====================================================
  // 1. SAVE DEVICE PUSH SUBSCRIPTION
  // ====================================================
  async savePushSubscription(userId: string, subscription: PushSubscriptionPayload) {
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      throw new Error('Push subscription data is incomplete');
    }

    const id = randomUUID();
    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (endpoint) 
      DO UPDATE SET user_id = $2, p256dh = $4, auth = $5, updated_at = NOW();
      `,
      id,
      userId,
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
    );

    this.logger.log(`Saved push subscription for user ${userId}`);
    return { success: true, message: 'Đăng ký nhận thông báo đẩy thành công!' };
  }

  // ====================================================
  // 2. SEND NOTIFICATION & WEB PUSH TO USER
  // ====================================================
  async sendNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string; // SESSION_DEDUCT | MEAL_REMINDER | WATER_REMINDER | WORKOUT_REMINDER | PT_REQUEST | PT_APPLICATION
    linkUrl?: string;
  }) {
    const { userId, title, message, type = 'INFO', linkUrl = '/home' } = data;
    const notifId = randomUUID();

    // 1. Lưu vào bảng notifications để hiển thị trong Notification Bell
    try {
      await this.prisma.$executeRawUnsafe(
        `
        INSERT INTO notifications (id, user_id, title, message, type, is_read, link_url, created_at)
        VALUES ($1, $2, $3, $4, $5, FALSE, $6, NOW());
        `,
        notifId,
        userId,
        title,
        message,
        type,
        linkUrl,
      );
    } catch (err) {
      this.logger.error(`Failed to store notification for user ${userId}:`, err);
    }

    // 2. Truy vấn danh sách subscription của user để bắn Web Push ra màn hình
    try {
      const subscriptions = (await this.prisma.$queryRawUnsafe(
        `
        SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1;
        `,
        userId,
      )) as Array<{ endpoint: string; p256dh: string; auth: string }>;

      if (subscriptions && subscriptions.length > 0) {
        const payload = JSON.stringify({
          title,
          body: message,
          icon: '/logo.png',
          badge: '/logo.png',
          url: linkUrl,
          data: {
            url: linkUrl,
            notifId,
            type,
          },
        });

        for (const sub of subscriptions) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload,
            );
          } catch (pushErr: any) {
            // Nếu subscription hết hạn (410 Gone / 404 Not Found), tự động dọn dẹp
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await this.prisma.$executeRawUnsafe(
                `DELETE FROM push_subscriptions WHERE endpoint = $1;`,
                sub.endpoint,
              );
            } else {
              this.logger.warn(`Push failed for endpoint ${sub.endpoint}:`, pushErr.message);
            }
          }
        }
      }
    } catch (err) {
      this.logger.error(`Error sending web push to user ${userId}:`, err);
    }

    return { success: true, notificationId: notifId };
  }

  // ====================================================
  // 3. GET NOTIFICATIONS LIST FOR BELL DROPDOWN
  // ====================================================
  async getNotifications(userId: string, limit = 20) {
    try {
      const rows = (await this.prisma.$queryRawUnsafe(
        `
        SELECT id, user_id as "userId", title, message, type, is_read as "isRead", link_url as "linkUrl", created_at as "createdAt"
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
        `,
        userId,
        limit,
      )) as Array<any>;

      const unreadCountRow = (await this.prisma.$queryRawUnsafe(
        `
        SELECT COUNT(*)::int as "unreadCount"
        FROM notifications
        WHERE user_id = $1 AND is_read = FALSE;
        `,
        userId,
      )) as Array<{ unreadCount: number }>;

      const unreadCount = unreadCountRow[0]?.unreadCount || 0;

      return {
        notifications: rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          title: r.title,
          message: r.message,
          type: r.type,
          isRead: Boolean(r.isRead),
          linkUrl: r.linkUrl || null,
          createdAt: new Date(r.createdAt).toISOString(),
        })),
        unreadCount,
      };
    } catch (err) {
      this.logger.error(`Failed to get notifications for user ${userId}:`, err);
      return { notifications: [], unreadCount: 0 };
    }
  }

  // ====================================================
  // 4. MARK AS READ
  // ====================================================
  async markAsRead(notificationId: string, userId: string) {
    await this.prisma.$executeRawUnsafe(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2;
      `,
      notificationId,
      userId,
    );
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.$executeRawUnsafe(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = $1 AND is_read = FALSE;
      `,
      userId,
    );
    return { success: true };
  }
}
