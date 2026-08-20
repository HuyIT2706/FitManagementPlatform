import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';

@UseGuards(JwtGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getAdminStats() {
    return this.adminService.getAdminStats();
  }

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
}
