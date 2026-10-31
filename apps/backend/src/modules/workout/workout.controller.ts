import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '@repo/types';

@UseGuards(JwtGuard)
@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Get('exercises')
  async getExercises(
    @Query('category') category?: string,
    @Query('muscle') muscle?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    try {
      return await this.workoutService.getExercises(
        category,
        muscle,
        search,
        page,
        limit,
      );
    } catch {
      return {
        data: [],
        total: 0,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        totalPages: 1,
      };
    }
  }

  @Get('assigned-meal-plan')
  async getAssignedMealPlan(@Request() req: RequestWithUser) {
    return this.workoutService.getAssignedMealPlan(req.user.sub);
  }

  @Get('assigned-workout-plan')
  async getAssignedWorkoutPlan(@Request() req: RequestWithUser) {
    return this.workoutService.getAssignedWorkoutPlan(req.user.sub);
  }
}
