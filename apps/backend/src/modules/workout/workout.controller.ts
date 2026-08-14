import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { WorkoutService } from './workout.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

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
    return this.workoutService.getExercises(category, muscle, search, page, limit);
  }

  @Get('assigned-meal-plan')
  async getAssignedMealPlan(@Request() req: RequestWithUser) {
    return this.workoutService.getAssignedMealPlan(req.user.sub);
  }
}
