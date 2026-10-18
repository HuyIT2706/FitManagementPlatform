import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateProgressPhotoDto, CreateBodyMetricDto } from '@repo/types';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getPhotos(userId: string) {
    return this.prisma.progressPhoto.findMany({
      where: { userId },
      orderBy: { takenAt: 'desc' },
    });
  }

  async addPhoto(userId: string, dto: CreateProgressPhotoDto) {
    return this.prisma.progressPhoto.create({
      data: {
        userId,
        photoUrl: dto.photoUrl,
        tag: dto.tag || 'AFTER',
        takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
      },
    });
  }

  async deletePhoto(userId: string, photoId: string) {
    const photo = await this.prisma.progressPhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      throw new NotFoundException('Không tìm thấy ảnh tiến trình');
    }

    if (photo.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa ảnh này');
    }

    return this.prisma.progressPhoto.delete({
      where: { id: photoId },
    });
  }

  async getMetrics(userId: string) {
    return this.prisma.bodyMetric.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async addMetric(userId: string, dto: CreateBodyMetricDto) {
    const metric = await this.prisma.bodyMetric.create({
      data: {
        userId,
        weight: dto.weight,
        height: dto.height,
        bodyFat: dto.bodyFat,
        muscleMass: dto.muscleMass,
      },
    });

    // Update current user height if provided
    if (dto.height) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { height: dto.height },
      });
    }

    return metric;
  }

  async updateMetric(
    userId: string,
    metricId: string,
    dto: {
      weight?: number;
      height?: number;
      bodyFat?: number;
      muscleMass?: number;
      recordedAt?: string;
    },
  ) {
    const metric = await this.prisma.bodyMetric.findUnique({
      where: { id: metricId },
    });
    if (!metric || metric.userId !== userId) {
      throw new ForbiddenException(
        'Không tìm thấy chỉ số này hoặc bạn không có quyền chỉnh sửa',
      );
    }
    return this.prisma.bodyMetric.update({
      where: { id: metricId },
      data: {
        weight: dto.weight !== undefined ? Number(dto.weight) : undefined,
        height: dto.height !== undefined ? Number(dto.height) : undefined,
        bodyFat: dto.bodyFat !== undefined ? Number(dto.bodyFat) : undefined,
        muscleMass:
          dto.muscleMass !== undefined ? Number(dto.muscleMass) : undefined,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
      },
    });
  }

  async deleteMetric(userId: string, metricId: string) {
    const metric = await this.prisma.bodyMetric.findUnique({
      where: { id: metricId },
    });
    if (!metric || metric.userId !== userId) {
      throw new ForbiddenException(
        'Không tìm thấy chỉ số này hoặc bạn không có quyền xóa',
      );
    }
    return this.prisma.bodyMetric.delete({
      where: { id: metricId },
    });
  }
}
