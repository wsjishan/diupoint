import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';

type AuthenticatedRequest = {
  user: {
    sub: string;
    email: string;
  };
};

@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/dashboard')
  getDashboard(@Req() req: AuthenticatedRequest) {
    return this.storesService.getDashboard(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: AuthenticatedRequest, @Body() dto: UpdateStoreDto) {
    return this.storesService.updateMe(req.user.sub, dto);
  }

  @Get(':slug')
  getPublicStore(@Param('slug') slug: string) {
    return this.storesService.getPublicStore(slug);
  }
}
