import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

type AuthenticatedRequest = {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/listings')
  getMyListings(@Req() req: AuthenticatedRequest) {
    return this.usersService.getMyListings(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/listings/:id')
  getMyListingById(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.usersService.getMyListingById(req.user.sub, id);
  }
}
