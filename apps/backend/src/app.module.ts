import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { PtModule } from './modules/pt/pt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    NutritionModule,
    WorkoutModule,
    PtModule,
  ],
})
export class AppModule {}
