import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { PtModule } from './modules/pt/pt.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Global rate limiting: 200 requests per minute per IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 200 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    NutritionModule,
    WorkoutModule,
    PtModule,
    ProgressModule,
    AdminModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    // Apply ThrottlerGuard globally to all routes
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
