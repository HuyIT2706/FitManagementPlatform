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
import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationsService } from './notifications.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '@repo/types';

export class PushSubscriptionKeysDto {
  @IsString()
  @IsNotEmpty()
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  auth!: string;
}

export class PushSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys!: PushSubscriptionKeysDto;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('vapid-public-key')
  getVapidPublicKey() {
    return {
      publicKey: this.notificationsService.vapidPublicKey || '',
    };
  }

  @UseGuards(JwtGuard)
  @Post('subscribe')
  async subscribe(
    @Request() req: RequestWithUser,
    @Body() body: PushSubscriptionDto,
  ) {
    const userId =
      req.user?.sub || (req.user as unknown as { id?: string })?.id || '';
    return this.notificationsService.savePushSubscription(userId, body);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getNotifications(@Request() req: RequestWithUser) {
    const userId =
      req.user?.sub || (req.user as unknown as { id?: string })?.id || '';
    return this.notificationsService.getNotifications(userId);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/read')
  async markAsRead(@Request() req: RequestWithUser, @Param('id') id: string) {
    const userId =
      req.user?.sub || (req.user as unknown as { id?: string })?.id || '';
    return this.notificationsService.markAsRead(id, userId);
  }

  @UseGuards(JwtGuard)
  @Patch('read-all')
  async markAllAsRead(@Request() req: RequestWithUser) {
    const userId =
      req.user?.sub || (req.user as unknown as { id?: string })?.id || '';
    return this.notificationsService.markAllAsRead(userId);
  }
}
