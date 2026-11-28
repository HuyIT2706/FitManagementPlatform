import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
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

  @SkipThrottle()
  @UseGuards(JwtGuard)
  @Get('stream')
  streamNotifications(
    @Request() req: RequestWithUser,
    @Res() res: ExpressResponse,
  ) {
    const userId =
      req.user?.sub || (req.user as unknown as { id?: string })?.id || '';
    if (!userId) {
      res.status(401).end();
      return;
    }

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const writeEvent = (eventName: string, data: unknown) => {
      if (res.writableEnded) return;
      res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
      (res as unknown as { flush?: () => void }).flush?.();
    };

    writeEvent('connected', { userId, timestamp: new Date().toISOString() });

    const unsubscribe = this.notificationsService.subscribeStream(
      userId,
      (payload) => {
        writeEvent(payload.event, payload);
      },
    );

    const heartbeat = setInterval(() => {
      if (res.writableEnded) return;
      res.write(': ping\n\n');
      (res as unknown as { flush?: () => void }).flush?.();
    }, 25000);

    const rawReq = req as unknown as ExpressRequest;
    rawReq.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
      if (!res.writableEnded) {
        res.end();
      }
    });
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
