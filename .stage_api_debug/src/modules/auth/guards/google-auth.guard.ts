import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{
      query?: { returnTo?: string };
    }>();
    const returnTo = request.query?.returnTo;

    return {
      scope: ['email', 'profile'],
      session: false,
      state:
        typeof returnTo === 'string' && returnTo.startsWith('/')
          ? returnTo
          : '/',
    };
  }
}
