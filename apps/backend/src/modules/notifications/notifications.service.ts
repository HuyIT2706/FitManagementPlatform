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

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl: string | null;
  createdAt: string | Date;
}

export interface UnreadCountRecord {
  unreadCount: number;
}

export interface WebPushErrorLike {
  statusCode?: number;
  message?: string;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  public readonly vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
  private readonly vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;
  private readonly vapidSubject = process.env.VAPID_SUBJECT!;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    webpush.setVapidDetails(
      this.vapidSubject,
      this.vapidPublicKey,
      this.vapidPrivateKey,
    );

    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          endpoint TEXT UNIQUE NOT NULL,
          p256dh TEXT NOT NULL,
          auth TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);

      // Ensure foreign key constraints exist on already created tables
      await this.prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_user'
          ) THEN
            ALTER TABLE notifications 
            ADD CONSTRAINT fk_notifications_user 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'fk_push_subscriptions_user'
          ) THEN
            ALTER TABLE push_subscriptions 
            ADD CONSTRAINT fk_push_subscriptions_user 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
      `);

      this.logger.log(
        'Notifications and PushSubscriptions tables verified with foreign keys.',
      );
    } catch (err) {
      this.logger.error('Error creating notification tables:', err);
    }
  }

  async savePushSubscription(
    userId: string,
    subscription: PushSubscriptionPayload,
  ) {
    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
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

  async sendNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    linkUrl?: string;
  }) {
    const { userId, title, message, type = 'INFO', linkUrl = '/home' } = data;
    const notifId = randomUUID();

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
      this.logger.error(
        `Failed to store notification for user ${userId}:`,
        err,
      );
    }

    try {
      const subscriptions = await this.prisma.$queryRawUnsafe<
        PushSubscriptionRecord[]
      >(
        `
        SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1;
        `,
        userId,
      );

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
          } catch (err) {
            const pushErr = err as WebPushErrorLike;
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await this.prisma.$executeRawUnsafe(
                `DELETE FROM push_subscriptions WHERE endpoint = $1;`,
                sub.endpoint,
              );
            } else {
              this.logger.warn(
                `Push failed for endpoint ${sub.endpoint}:`,
                pushErr.message,
              );
            }
          }
        }
      }
    } catch (err) {
      this.logger.error(`Error sending web push to user ${userId}:`, err);
    }

    return { success: true, notificationId: notifId };
  }

  async getNotifications(userId: string, limit = 20) {
    try {
      const rows = await this.prisma.$queryRawUnsafe<NotificationRecord[]>(
        `
        SELECT id, user_id as "userId", title, message, type, is_read as "isRead", link_url as "linkUrl", created_at as "createdAt"
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2;
        `,
        userId,
        limit,
      );

      const unreadCountRow = await this.prisma.$queryRawUnsafe<
        UnreadCountRecord[]
      >(
        `
        SELECT COUNT(*)::int as "unreadCount"
        FROM notifications
        WHERE user_id = $1 AND is_read = FALSE;
        `,
        userId,
      );

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
