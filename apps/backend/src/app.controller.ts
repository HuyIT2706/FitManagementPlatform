import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'NutriCore API',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async getHealthCheck(@Res() res: Response) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return res.status(HttpStatus.OK).json({
        status: 'ok',
        database: 'connected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'error',
        database: 'disconnected',
        error: err instanceof Error ? err.message : 'Database ping failed',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    }
  }
}
