import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Role } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // 1. STATS & ANALYTICS
  // ==========================================
  @Get('stats')
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

  @Get('analytics')
  async getAnalyticsOverview() {
    return this.adminService.getAnalyticsOverview();
  }

  // ==========================================
  // 2. PT APPLICATIONS
  // ==========================================
  @Get('pt-applications')
  async getPtApplications(@Query('status') status?: string) {
    return this.adminService.getPtApplications(status);
  }

  @Post('pt-applications/:id/approve')
  async approvePtApplication(
    @Param('id') id: string,
    @Body('note') note?: string,
  ) {
    return this.adminService.approvePtApplication(id, note);
  }

  @Post('pt-applications/:id/reject')
  async rejectPtApplication(
    @Param('id') id: string,
    @Body('note') note?: string,
  ) {
    return this.adminService.rejectPtApplication(id, note);
  }

  // ==========================================
  // 3. USER MANAGEMENT & ROLE
  // ==========================================
  @Get('users')
  async getUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.adminService.getUsers({ page, limit, search, role });
  }

  @Patch('users/:id/role')
  async updateUserRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ==========================================
  // 4. EXERCISE LIBRARY (CRUD)
  // ==========================================
  @Get('exercises')
  async getExercises(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.adminService.getExercises({ page, limit, search, category });
  }

  @Post('exercises')
  async createExercise(
    @Body()
    body: {
      id?: string;
      name: string;
      category?: string;
      equipment?: string;
      primaryMuscles?: string[];
      secondaryMuscles?: string[];
      instructions?: string[];
      setupImageUrl?: string;
      startImageUrl?: string;
    },
  ) {
    return this.adminService.createExercise(body);
  }

  @Put('exercises/:id')
  async updateExercise(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      category?: string;
      equipment?: string;
      primaryMuscles?: string[];
      secondaryMuscles?: string[];
      instructions?: string[];
      setupImageUrl?: string;
      startImageUrl?: string;
    },
  ) {
    return this.adminService.updateExercise(id, body);
  }

  @Delete('exercises/:id')
  async deleteExercise(@Param('id') id: string) {
    return this.adminService.deleteExercise(id);
  }

  // ==========================================
  // 5. FOOD LIBRARY (CRUD)
  // ==========================================
  @Get('foods')
  async getFoods(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
  ) {
    return this.adminService.getFoods({ page, limit, search, category });
  }

  @Post('foods')
  async createFood(
    @Body()
    body: {
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
    return this.adminService.createFood(body);
  }

  @Put('foods/:id')
  async updateFood(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      caloriesPer100g?: number;
      proteinPer100g?: number;
      carbsPer100g?: number;
      fatPer100g?: number;
      fiberPer100g?: number;
      category?: string;
      imageUrl?: string;
    },
  ) {
    return this.adminService.updateFood(id, body);
  }

  @Delete('foods/:id')
  async deleteFood(@Param('id') id: string) {
    return this.adminService.deleteFood(id);
  }
}
