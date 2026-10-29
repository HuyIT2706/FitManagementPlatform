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
      publicKey: this.notificationsService.vapidPublicKey,
    };
  }

  @UseGuards(JwtGuard)
  @Post('subscribe')
  async subscribe(
    @Request() req: RequestWithUser,
    @Body() body: PushSubscriptionDto,
  ) {
    return this.notificationsService.savePushSubscription(req.user.sub, body);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getNotifications(@Request() req: RequestWithUser) {
    return this.notificationsService.getNotifications(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Patch(':id/read')
  async markAsRead(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Patch('read-all')
  async markAllAsRead(@Request() req: RequestWithUser) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }
}
