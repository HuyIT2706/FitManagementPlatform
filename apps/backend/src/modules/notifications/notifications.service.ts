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

  public readonly vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  private readonly vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  private readonly vapidSubject = process.env.VAPID_SUBJECT;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    if (this.vapidSubject && this.vapidPublicKey && this.vapidPrivateKey) {
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
    } else {
      this.logger.warn(
        'WebPush VAPID keys not configured in environment variables.',
      );
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
    if (!userId) {
      return { notifications: [], unreadCount: 0 };
    }
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
          createdAt:
            r.createdAt instanceof Date
              ? r.createdAt.toISOString()
              : r.createdAt
                ? new Date(r.createdAt).toISOString()
                : new Date().toISOString(),
        })),
        unreadCount,
      };
    } catch (err) {
      this.logger.error(`Failed to get notifications for user ${userId}:`, err);
      return { notifications: [], unreadCount: 0 };
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    if (!notificationId || !userId) return { success: true };
    try {
      await this.prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
    } catch (err) {
      this.logger.error(
        `Failed to mark notification ${notificationId} as read:`,
        err,
      );
    }
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    if (!userId) return { success: true };
    try {
      await this.prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch (err) {
      this.logger.error(
        `Failed to mark all notifications as read for ${userId}:`,
        err,
      );
    }
    return { success: true };
  }
}
