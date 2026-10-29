import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
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

  public readonly vapidPublicKey =
    process.env.VAPID_PUBLIC_KEY ||
    'BJznxhmzusTKjOPidEXnMdtFyES4cU8i00t9ZwGBJk1UZizbIByNIrVxZggR72LRzbm3JYfsYt907OzFfoRLR2I';
  private readonly vapidPrivateKey =
    process.env.VAPID_PRIVATE_KEY ||
    'iTdcAwDueONNxBd6yF4wYswGSX5QfiG9tjUI--hmEL8';
  private readonly vapidSubject =
    process.env.VAPID_SUBJECT || 'mailto:support@nutricore.vn';

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      webpush.setVapidDetails(
        this.vapidSubject,
        this.vapidPublicKey,
        this.vapidPrivateKey,
      );
      this.logger.log('WebPush VAPID details configured successfully.');
    } catch (err) {
      this.logger.error('Failed to configure VAPID details:', err);
    }

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
      throw new BadRequestException(
        'Thông tin push subscription không hợp lệ hoặc thiếu keys',
      );
    }

    try {
      await this.prisma.pushSubscription.upsert({
        where: { endpoint: subscription.endpoint },
        create: {
          userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        update: {
          userId,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Saved push subscription for user ${userId}`);
      return {
        success: true,
        message: 'Đăng ký nhận thông báo đẩy thành công!',
      };
    } catch (dbErr) {
      this.logger.error(
        `Failed to save push subscription for user ${userId}:`,
        dbErr,
      );
      return { success: false, message: 'Không thể lưu subscription vào CSDL' };
    }
  }

  async sendNotification(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
    linkUrl?: string;
  }) {
    const { userId, title, message, type = 'INFO', linkUrl = '/home' } = data;
    let notifId: string;

    try {
      const created = await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          linkUrl,
        },
      });
      notifId = created.id;
    } catch (err) {
      this.logger.error(
        `Failed to store notification for user ${userId}:`,
        err,
      );
      notifId = randomUUID();
    }

    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { userId },
        select: {
          endpoint: true,
          p256dh: true,
          auth: true,
        },
      });

      if (subscriptions && subscriptions.length > 0) {
        const payload = JSON.stringify({
          title,
          body: message,
          icon: '/android-chrome-192x192.png',
          badge: '/favicon-32x32.png',
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
              {
                TTL: 86400,
                urgency: 'high',
              },
            );
          } catch (err) {
            const pushErr = err as WebPushErrorLike;
            if (pushErr.statusCode === 410 || pushErr.statusCode === 404) {
              await this.prisma.pushSubscription.deleteMany({
                where: { endpoint: sub.endpoint },
              });
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
      const [rows, unreadCount] = await Promise.all([
        this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: limit,
        }),
        this.prisma.notification.count({
          where: { userId, isRead: false },
        }),
      ]);

      return {
        notifications: rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          title: r.title,
          message: r.message,
          type: r.type || 'INFO',
          isRead: r.isRead,
          linkUrl: r.linkUrl || null,
          createdAt: r.createdAt.toISOString(),
        })),
        unreadCount,
      };
    } catch (err) {
      this.logger.error(`Failed to get notifications for user ${userId}:`, err);
      return { notifications: [], unreadCount: 0 };
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  }
}
