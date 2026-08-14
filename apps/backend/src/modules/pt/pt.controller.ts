import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PtService } from './pt.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import type {
  AssignNutritionDto,
  AssignWorkoutDto,
  BindPtDto,
  SendInviteDto,
  UpdateInBodyDto,
  UpdateStudentSessionsDto,
} from '@repo/types';

@UseGuards(JwtGuard)
@Controller('pt')
export class PtController {
  constructor(private readonly ptService: PtService) {}

  @Get('dashboard')
  async getDashboardData(@Request() req: RequestWithUser) {
    return this.ptService.getDashboardData(req.user.sub);
  }

  @Get('code-qr')
  async getPtCodeAndQr(@Request() req: RequestWithUser) {
    return this.ptService.getPtCodeAndQr(req.user.sub);
  }

  @Get('students/:id')
  async getStudentDetail(@Param('id') id: string) {
    return this.ptService.getStudentDetail(id);
  }

  @Post('students/invite')
  async sendInvite(
    @Request() req: RequestWithUser,
    @Body() dto: SendInviteDto,
  ) {
    return this.ptService.sendStudentInvite(req.user.sub, dto);
  }

  @Post('students/bind')
  async bindPt(@Request() req: RequestWithUser, @Body() dto: BindPtDto) {
    return this.ptService.bindPtByStudent(req.user.sub, dto);
  }

  @Patch('students/:id')
  async updateStudent(
    @Param('id') id: string,
    @Body() dto: UpdateStudentSessionsDto,
  ) {
    return this.ptService.updateStudentSessions(id, dto);
  }

  @Post('students/:id/assign-workout')
  async assignWorkout(@Param('id') id: string, @Body() dto: AssignWorkoutDto) {
    return this.ptService.assignWorkoutToStudent({ ...dto, studentId: id });
  }

  @Post('students/:id/assign-nutrition')
  async assignNutrition(
    @Param('id') id: string,
    @Body() dto: AssignNutritionDto,
  ) {
    return this.ptService.assignNutritionToStudent({ ...dto, studentId: id });
  }

  @Post('students/:id/inbody')
  async updateInBody(@Param('id') id: string, @Body() dto: UpdateInBodyDto) {
    return this.ptService.updateInBody({ ...dto, studentId: id });
  }

  @Post('check-in/:sessionId')
  async checkInSession(@Param('sessionId') sessionId: string) {
    return this.ptService.checkInSession(sessionId);
  }

  @Post('approve-meal/:mealId')
  async approveMeal(
    @Param('mealId') mealId: string,
    @Body('note') note?: string,
  ) {
    return this.ptService.approveMeal(mealId, note);
  }
}
