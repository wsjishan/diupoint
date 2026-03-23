import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

type AuthenticatedRequest = {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.favoritesService.list(req.user.sub);
  }

  @Post(':listingId')
  add(@Req() req: AuthenticatedRequest, @Param('listingId') listingId: string) {
    return this.favoritesService.add(req.user.sub, listingId);
  }

  @Delete(':listingId')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('listingId') listingId: string
  ) {
    return this.favoritesService.remove(req.user.sub, listingId);
  }
}
