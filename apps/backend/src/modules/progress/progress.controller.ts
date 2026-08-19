import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser, CreateProgressPhotoDto, CreateBodyMetricDto } from '@repo/types';

@UseGuards(JwtGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('photos')
  async getPhotos(@Request() req: RequestWithUser) {
    return this.progressService.getPhotos(req.user.sub);
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
}
