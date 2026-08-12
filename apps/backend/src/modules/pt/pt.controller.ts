import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { PtService } from './pt.service';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@UseGuards(JwtGuard)
@Controller('pt')
export class PtController {
  constructor(private readonly ptService: PtService) {}

  @Get('dashboard')
  async getDashboardData(@Request() req: RequestWithUser) {
    return this.ptService.getDashboardData(req.user.sub);
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
