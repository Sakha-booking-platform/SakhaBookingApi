import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthService } from '../services/auth.service';

import { RequestLoginDto }
from '../dto/request-login.dto';

import { VerifyTokenDto }
from '../dto/verify-token.dto';


import { AuthGuard } from '../guards/auth.guard';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  async requestLogin(
    @Body() dto: RequestLoginDto,
  ) {
    return this.authService.requestLogin(dto);
  }

  @Post('verify')
  async verify(
    @Body() dto: VerifyTokenDto,
  ) {
    return this.authService.verifyToken(dto);
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async currentUser(
    @Req() req: any,
  ) {
    return this.authService.getCurrentUser(req.user);
  }

  @Post('logout')
  async logout(
    @Req() req: any,
  ) {
    return this.authService.logout(req.user.id);
  }
}