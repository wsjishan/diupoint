import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfirmVerificationDto } from './dto/confirm-verification.dto';
import { RequestVerificationDto } from './dto/request-verification.dto';
import { VerificationService } from './verification.service';

type AuthenticatedRequest = {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request')
  requestVerification(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RequestVerificationDto
  ) {
    return this.verificationService.requestVerification(req.user.sub, dto);
  }

  @Post('confirm')
  confirmVerification(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ConfirmVerificationDto
  ) {
    return this.verificationService.confirmVerification(req.user.sub, dto);
  }
}
