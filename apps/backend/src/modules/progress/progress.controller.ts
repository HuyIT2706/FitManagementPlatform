import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtGuard } from '../auth/jwt.guard';
import type {
  RequestWithUser,
  CreateProgressPhotoDto,
  CreateBodyMetricDto,
} from '@repo/types';

@UseGuards(JwtGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('photos')
  async getPhotos(@Request() req: RequestWithUser) {
    try {
      const user = req.user as { sub?: string; id?: string } | undefined;
      const userId = user?.sub || user?.id;
      if (!userId || typeof userId !== 'string') return [];
      return await this.progressService.getPhotos(userId);
    } catch {
      return [];
    }
  }

  @Post('photos')
  async addPhoto(
    @Request() req: RequestWithUser,
    @Body() dto: CreateProgressPhotoDto,
  ) {
    return this.progressService.addPhoto(req.user.sub, dto);
  }

  @Delete('photos/:id')
  async deletePhoto(
    @Request() req: RequestWithUser,
    @Param('id') photoId: string,
  ) {
    return this.progressService.deletePhoto(req.user.sub, photoId);
  }

  @Get('metrics')
  async getMetrics(@Request() req: RequestWithUser) {
    return this.progressService.getMetrics(req.user.sub);
  }

  @Post('metrics')
  async addMetric(
    @Request() req: RequestWithUser,
    @Body() dto: CreateBodyMetricDto,
  ) {
    return this.progressService.addMetric(req.user.sub, dto);
  }

  @Patch('metrics/:id')
  async updateMetric(
    @Request() req: RequestWithUser,
    @Param('id') metricId: string,
    @Body()
    dto: {
      weight?: number;
      height?: number;
      bodyFat?: number;
      muscleMass?: number;
      recordedAt?: string;
    },
  ) {
    return this.progressService.updateMetric(req.user.sub, metricId, dto);
  }

  @Delete('metrics/:id')
  async deleteMetric(
    @Request() req: RequestWithUser,
    @Param('id') metricId: string,
  ) {
    return this.progressService.deleteMetric(req.user.sub, metricId);
  }
}
