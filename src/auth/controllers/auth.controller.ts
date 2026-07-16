import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '../services/auth.service';
import { RequestLoginDto } from '../dto/request-login.dto';
import { VerifyTokenDto } from '../dto/verify-token.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  DocRequestLogin,
  DocVerifyToken,
  DocRefreshToken,
  DocGetCurrentUser,
  DocLogout,
} from '../auth.docs';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @DocRequestLogin()
  async requestLogin(@Body() dto: RequestLoginDto) {
    return this.authService.requestLogin(dto);
  }

  @Post('verify')
  @DocVerifyToken()
  async verify(@Body() dto: VerifyTokenDto) {
    return this.authService.verifyToken(dto);
  }

  @Post('refresh')
  @DocRefreshToken()
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @DocGetCurrentUser()
  async currentUser(@CurrentUser() user: any) {
    return this.authService.getCurrentUser(user);
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  @DocLogout()
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.id);
  }
}