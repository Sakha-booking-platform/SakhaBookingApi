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
import { CurrentUser } from '../decorators/current-user.decorator';

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
   @CurrentUser() user: any,
  ) {
    return this.authService.getCurrentUser(user);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  async logout(
   @CurrentUser() user: any,
  ) {
    return this.authService.logout(user.id);
  }
}