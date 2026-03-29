import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { markDeprecatedRoute } from '../../common/http/deprecation';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { FavoritesService } from './favorites.service';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name);

  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) {
    return this.favoritesService.list(req.user.sub);
  }

  @Post()
  add(@Req() req: AuthenticatedRequest, @Body() dto: AddFavoriteDto) {
    return this.favoritesService.add(req.user.sub, dto.listingId);
  }

  @Post(':listingId')
  addLegacy(
    @Req() req: AuthenticatedRequest,
    @Param('listingId') listingId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    markDeprecatedRoute({
      canonicalPath: '/api/favorites',
      logger: this.logger,
      req,
      res,
    });

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
