import {
  Controller,
  Patch,
  Body,
  UseGuards,
  Request,
  Get,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { JwtGuard } from '../auth/jwt.guard';
import type { RequestWithUser } from '@repo/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtGuard)
  @Get('me')
  async getMe(@Request() req: RequestWithUser) {
    return this.usersService.getMe(req.user.sub);
  }

  @UseGuards(JwtGuard)
  @Patch('onboarding')
  async completeOnboarding(
    @Request() req: RequestWithUser,
    @Body() dto: OnboardingDto,
  ) {
    return this.usersService.completeOnboarding(req.user.sub, dto);
  }

  @UseGuards(JwtGuard)
  @Post('preview-tdee')
  previewTdee(@Body() dto: OnboardingDto) {
    return this.usersService.previewTDEE(dto);
  }
}
