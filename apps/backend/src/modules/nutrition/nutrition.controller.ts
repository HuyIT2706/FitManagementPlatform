import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { LogMealDto } from './dto/log-meal.dto';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '@repo/types';

@UseGuards(JwtGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('foods')
  async searchFoods(
    @Query('q') query?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.nutritionService.searchFoods(query, page, limit);
  }

  @Post('meals')
  async logMeal(@Request() req: RequestWithUser, @Body() dto: LogMealDto) {
    return this.nutritionService.logMeal(req.user.sub, dto);
  }

  @Get('streak')
  async getStreakData(@Request() req: RequestWithUser) {
    return this.nutritionService.getStreakData(req.user.sub);
  }

  @Get('daily')
  async getDailyNutrition(
    @Request() req: RequestWithUser,
    @Query('date') dateString?: string,
  ) {
    // If no date is provided, use today's date
    const date = dateString ? new Date(dateString) : new Date();
    return this.nutritionService.getDailyNutrition(req.user.sub, date);
  }
}
