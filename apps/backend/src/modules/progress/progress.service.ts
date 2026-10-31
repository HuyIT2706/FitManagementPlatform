import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateProgressPhotoDto, CreateBodyMetricDto } from '@repo/types';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);
  constructor(private readonly prisma: PrismaService) {}

  async getPhotos(userId: string) {
    if (!userId || typeof userId !== 'string') return [];
    try {
      const [photos, bodyMetrics] = await Promise.all([
        this.prisma.progressPhoto.findMany({
          where: { userId },
          orderBy: { takenAt: 'desc' },
        }),
        this.prisma.bodyMetric.findMany({
          where: { userId },
          orderBy: { recordedAt: 'asc' },
          select: { weight: true, recordedAt: true },
        }),
      ]);

      const earliestWeight =
        bodyMetrics.length > 0 ? bodyMetrics[0].weight : null;
      const latestWeight =
        bodyMetrics.length > 0
          ? bodyMetrics[bodyMetrics.length - 1].weight
          : null;

      return photos.map((p) => {
        let cleanTag = p.tag || 'AFTER';
        let weightAtTime: number | null = null;

        if (cleanTag.includes('|')) {
          const parts = cleanTag.split('|');
          cleanTag = parts[0];
          const parsed = parseFloat(parts[1]);
          if (!isNaN(parsed)) {
            weightAtTime = parsed;
          }
        }

        if (weightAtTime === null) {
          if (cleanTag === 'BEFORE') {
            weightAtTime = earliestWeight;
          } else if (cleanTag === 'AFTER') {
            weightAtTime = latestWeight;
          }
        }

        return {
          ...p,
          tag: cleanTag,
          weightAtTime,
        };
      });
    } catch (err) {
      this.logger.warn(
        `Prisma progress photos failed for user ${userId}, running raw SQL fallback:`,
        err,
      );
      try {
        const rawPhotos = await this.prisma.$queryRawUnsafe<
          Array<Record<string, unknown>>
        >(
          `SELECT * FROM progress_photos 
           WHERE "userId" = $1 OR user_id = $1 
           ORDER BY COALESCE("takenAt", taken_at, CURRENT_TIMESTAMP) DESC`,
          userId,
        );

        return rawPhotos.map((p) => {
          const id = typeof p.id === 'string' ? p.id : '';
          const pUserId =
            typeof p.userId === 'string'
              ? p.userId
              : typeof p.user_id === 'string'
                ? p.user_id
                : userId;
          const photoUrl =
            typeof p.photoUrl === 'string'
              ? p.photoUrl
              : typeof p.photo_url === 'string'
                ? p.photo_url
                : '';
          const tag = typeof p.tag === 'string' ? p.tag : 'AFTER';
          const takenAt =
            p.takenAt instanceof Date
              ? p.takenAt
              : p.taken_at instanceof Date
                ? p.taken_at
                : new Date();

          return {
            id,
            userId: pUserId,
            photoUrl,
            tag,
            takenAt,
            weightAtTime: null,
          };
        });
      } catch {
        return [];
      }
    }
  }

  async addPhoto(userId: string, dto: CreateProgressPhotoDto) {
    if (dto.weightAtTime && dto.weightAtTime > 0) {
      await this.prisma.bodyMetric.create({
        data: {
          userId,
          weight: dto.weightAtTime,
          recordedAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
        },
      });
    }

    const tagToSave =
      dto.weightAtTime && dto.weightAtTime > 0
        ? `${dto.tag || 'AFTER'}|${dto.weightAtTime}`
        : dto.tag || 'AFTER';

    const created = await this.prisma.progressPhoto.create({
      data: {
        userId,
        photoUrl: dto.photoUrl,
        tag: tagToSave,
        takenAt: dto.takenAt ? new Date(dto.takenAt) : new Date(),
      },
    });

    return {
      ...created,
      tag: dto.tag || 'AFTER',
      weightAtTime: dto.weightAtTime || null,
    };
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

    if (dto.weight && dto.weight > 0) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { targetWeight: true, goal: true },
      });

      if (user?.targetWeight) {
        const isGain = user.goal === 'GAIN_WEIGHT';
        const isLoss = user.goal === 'LOSE_WEIGHT';

        if (
          (isGain && dto.weight > user.targetWeight) ||
          (isLoss && dto.weight < user.targetWeight) ||
          (!user.goal && dto.weight > user.targetWeight)
        ) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { targetWeight: dto.weight },
          });
        }
      }
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
