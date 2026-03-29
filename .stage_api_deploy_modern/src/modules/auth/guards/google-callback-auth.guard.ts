import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleCallbackAuthGuard extends AuthGuard('google') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  getAuthenticateOptions(_context: ExecutionContext) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL')?.trim();
    const normalizedFrontendUrl =
      frontendUrl && frontendUrl.length > 0
        ? frontendUrl.replace(/\/$/, '')
        : 'http://localhost:3000';

    return {
      session: false,
      failureRedirect: `${normalizedFrontendUrl}/auth/callback?error=google_auth_failed`,
    };
  }
}
