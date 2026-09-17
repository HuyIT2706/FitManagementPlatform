import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationsService, PushSubscriptionPayload } from './notifications.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '@repo/types';

export class PushSubscriptionDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 1. Lấy VAPID Public Key để frontend khởi tạo PushManager
  @Get('vapid-public-key')
  getVapidPublicKey() {
    return {
      publicKey: this.notificationsService.vapidPublicKey,
    };
  }

  // 2. Lưu thiết bị Push Subscription của User
  @UseGuards(JwtGuard)
  @Post('subscribe')
  async subscribe(
    @Request() req: RequestWithUser,
    @Body() body: PushSubscriptionDto,
  ) {
    return this.notificationsService.savePushSubscription(req.user.sub, body);
  }

  // 3. Lấy danh sách thông báo của User
  @UseGuards(JwtGuard)
  @Get()
  async getNotifications(@Request() req: RequestWithUser) {
    return this.notificationsService.getNotifications(req.user.sub);
  }

  // 4. Đánh dấu 1 thông báo đã đọc
  @UseGuards(JwtGuard)
  @Patch(':id/read')
  async markAsRead(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  // 5. Đánh dấu tất cả thông báo đã đọc
  @UseGuards(JwtGuard)
  @Patch('read-all')
  async markAllAsRead(@Request() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }
}

