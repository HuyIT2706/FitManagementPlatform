import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PtService } from './pt.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import type { RequestWithUser } from '@repo/types';
import type {
  AssignNutritionDto,
  AssignWorkoutDto,
  BindPtDto,
  CreateProgressPhotoDto,
  SendInviteDto,
  UpdateInBodyDto,
  UpdateStudentSessionsDto,
} from '@repo/types';

@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.PT)
@Controller('pt')
export class PtController {
  constructor(private readonly ptService: PtService) {}

  @Get('dashboard')
  async getDashboardData(@Request() req: RequestWithUser) {
    return this.ptService.getDashboardData(req.user.sub);
  }

  @Get('schedule')
  async getPtSchedule(
    @Request() req: RequestWithUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.ptService.getPtScheduleRange(req.user.sub, startDate, endDate);
  }

  @Post('schedule')
  async createPtSchedule(
    @Request() req: RequestWithUser,
    @Body()
    dto: {
      studentId: string;
      title: string;
      scheduledDate: string;
      timeSlot?: string;
      note?: string;
    },
  ) {
    return this.ptService.createPtScheduleSession(req.user.sub, dto);
  }

  @Post('schedule/batch')
  async createPtScheduleBatch(
    @Request() req: RequestWithUser,
    @Body()
    dto: {
      studentId: string;
      title: string;
      timeSlot?: string;
      dates: string[];
    },
  ) {
    return this.ptService.createPtScheduleBatch(req.user.sub, dto);
  }

  @Get('code-qr')
  async getPtCodeAndQr(@Request() req: RequestWithUser) {
    let origin = req.headers?.origin as string | undefined;
    if (!origin && req.headers?.referer) {
      try {
        origin = new URL(req.headers.referer as string).origin;
      } catch {
        // Ignore malformed referer
      }
    }
    return this.ptService.getPtCodeAndQr(req.user.sub, origin);
  }

  @Get('profile')
  async getPtProfile(@Request() req: RequestWithUser) {
    return this.ptService.getPtProfile(req.user.sub);
  }

  @Patch('profile')
  async updatePtProfile(
    @Request() req: RequestWithUser,
    @Body()
    dto: {
      fullName?: string;
      phone?: string;
      avatarUrl?: string;
      bio?: string;
      experienceYears?: number;
      specialties?: string[];
      certificateUrl?: string;
    },
  ) {
    return this.ptService.updatePtProfile(req.user.sub, dto);
  }

  @Get('students/requests')
  async getPendingStudentRequests(@Request() req: RequestWithUser) {
    return this.ptService.getPendingStudentRequests(req.user.sub);
  }

  @Post('students/requests/:id/approve')
  async approveStudentRequest(
    @Request() req: RequestWithUser,
    @Param('id') requestId: string,
  ) {
    return this.ptService.approveStudentRequest(req.user.sub, requestId);
  }

  @Post('students/accept/:id')
  async acceptStudentRequest(
    @Request() req: RequestWithUser,
    @Param('id') requestId: string,
  ) {
    return this.ptService.approveStudentRequest(req.user.sub, requestId);
  }

  @Post('students/requests/:id/reject')
  async rejectStudentRequest(
    @Request() req: RequestWithUser,
    @Param('id') requestId: string,
  ) {
    return this.ptService.rejectStudentRequest(req.user.sub, requestId);
  }

  @Post('students/reject/:id')
  async rejectStudentRequestAlias(
    @Request() req: RequestWithUser,
    @Param('id') requestId: string,
  ) {
    return this.ptService.rejectStudentRequest(req.user.sub, requestId);
  }

  @Post('students/invite')
  async sendInvite(
    @Request() req: RequestWithUser,
    @Body() dto: SendInviteDto,
  ) {
    let origin = req.headers?.origin as string | undefined;
    if (!origin && req.headers?.referer) {
      try {
        origin = new URL(req.headers.referer as string).origin;
      } catch {
        // Ignore malformed referer
      }
    }
    return this.ptService.sendStudentInvite(req.user.sub, dto, origin);
  }

  @Roles(Role.USER, Role.PT)
  @Post('students/bind')
  async bindPt(@Request() req: RequestWithUser, @Body() dto: BindPtDto) {
    return this.ptService.bindPtByStudent(req.user.sub, dto);
  }

  @Roles(Role.USER, Role.PT)
  @Delete('students/bind')
  async cancelBindPt(@Request() req: RequestWithUser) {
    return this.ptService.cancelBindRequest(req.user.sub);
  }

  @Get('students/:id/photos')
  async getStudentPhotos(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.ptService.getStudentPhotos(id, req.user.sub);
  }

  @Post('students/:id/photos')
  async addStudentPhoto(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CreateProgressPhotoDto,
  ) {
    return this.ptService.addStudentPhoto(id, dto, req.user.sub);
  }

  @Delete('students/:id/photos/:photoId')
  async deleteStudentPhoto(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('photoId') photoId: string,
  ) {
    return this.ptService.deleteStudentPhoto(id, photoId, req.user.sub);
  }

  @Get('students/:id/meals')
  async getStudentMeals(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.ptService.getStudentMeals(id, req.user.sub);
  }

  @Post('students/:id/assign-workout')
  async assignWorkout(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: AssignWorkoutDto,
  ) {
    return this.ptService.assignWorkoutToStudent(
      { ...dto, studentId: id },
      req.user.sub,
    );
  }

  @Post('students/:id/assign-nutrition')
  async assignNutrition(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: AssignNutritionDto,
  ) {
    return this.ptService.assignNutritionToStudent(
      { ...dto, studentId: id },
      req.user.sub,
    );
  }

  @Post('students/:id/inbody')
  async updateInBody(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateInBodyDto,
  ) {
    return this.ptService.updateInBody({ ...dto, studentId: id }, req.user.sub);
  }

  @Patch('students/:id')
  async updateStudent(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateStudentSessionsDto,
  ) {
    return this.ptService.updateStudentSessions(id, dto, req.user.sub);
  }

  @Get('students/:id')
  async getStudentDetail(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.ptService.getStudentDetail(id, req.user.sub);
  }

  @Post('check-in/:sessionId')
  async checkInSession(@Param('sessionId') sessionId: string) {
    return this.ptService.checkInSession(sessionId);
  }

  @Post('approve-meal/:mealId')
  async approveMeal(
    @Request() req: RequestWithUser,
    @Param('mealId') mealId: string,
    @Body('note') note?: string,
  ) {
    return this.ptService.approveMeal(mealId, req.user.sub, note);
  }
}
