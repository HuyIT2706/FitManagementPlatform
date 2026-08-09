/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
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

@UseGuards(JwtGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('foods')
  async searchFoods(@Query('q') query?: string) {
    return this.nutritionService.searchFoods(query);
  }

  @Post('meals')
  async logMeal(@Request() req, @Body() dto: LogMealDto) {
    return this.nutritionService.logMeal(req.user.sub, dto);
  }

  @Get('daily')
  async getDailyNutrition(@Request() req, @Query('date') dateString?: string) {
    // If no date is provided, use today's date
    const date = dateString ? new Date(dateString) : new Date();
    return this.nutritionService.getDailyNutrition(req.user.sub, date);
  }
}
