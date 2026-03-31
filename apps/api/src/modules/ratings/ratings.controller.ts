import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateRatingDto } from './dto/create-rating.dto';
import { RatingsService } from './ratings.service';

type AuthenticatedRequest = Request & {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('listings/:listingId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get()
  getListingRatings(@Param('listingId') listingId: string) {
    return this.ratingsService.getListingRatings(listingId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getUserRating(
    @Req() req: AuthenticatedRequest,
    @Param('listingId') listingId: string
  ) {
    return this.ratingsService.getUserRating(req.user.sub, listingId);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  createOrUpdateRating(
    @Req() req: AuthenticatedRequest,
    @Param('listingId') listingId: string,
    @Body() dto: CreateRatingDto
  ) {
    return this.ratingsService.createOrUpdateRating(
      req.user.sub,
      listingId,
      dto
    );
  }
}
