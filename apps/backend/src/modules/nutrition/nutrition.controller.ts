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
import {
  SmartParseFoodDto,
  SmartParseFoodImageDto,
} from './dto/smart-parse.dto';
import { GenerateMealPlanDto } from './dto/generate-meal-plan.dto';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '@repo/types';

@UseGuards(JwtGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('foods')
  async searchFoods(
    @Request() req: RequestWithUser,
    @Query('q') query?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isHistory') isHistory?: string,
  ) {
    if (isHistory === 'true' && (!query || query.trim() === '')) {
      return this.nutritionService.getUserRecentFoods(
        req.user.sub,
        page,
        limit,
      );
    }
    return this.nutritionService.searchFoods(query, page, limit, category);
  }

  @Post('foods')
  async createFood(
    @Body()
    dto: {
      name: string;
      caloriesPer100g: number;
      proteinPer100g: number;
      carbsPer100g: number;
      fatPer100g: number;
      fiberPer100g?: number;
      category?: string;
      imageUrl?: string;
    },
  ) {
    return this.nutritionService.createFood(dto);
  }

  @Post('smart-parse')
  async smartParseFood(@Body() dto: SmartParseFoodDto) {
    return this.nutritionService.smartParseFoodInput(dto.text);
  }

  @Post('smart-image-parse')
  async smartImageParse(@Body() dto: SmartParseFoodImageDto) {
    return this.nutritionService.smartParseFoodImage(dto.imageBase64);
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
    const date = dateString ? new Date(dateString) : new Date();
    return this.nutritionService.getDailyNutrition(req.user.sub, date);
  }

  @Post('generate-meal-plan')
  async generateMealPlan(
    @Request() req: RequestWithUser,
    @Body() dto: GenerateMealPlanDto,
  ) {
    return this.nutritionService.generateMealPlan(req.user.sub, dto);
  }
}

