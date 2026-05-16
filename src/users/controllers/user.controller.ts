import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { CreateUserDto } from '../dto/create_user.dyo';
import { FindUserByEmailDto } from '../dto/find_user_by_email.dto';
import { CreatePatientProfileDto } from '../dto/create-patient-profile.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get(':id')
  async getUserById(@Param('id') id: String) {
    return await this.usersService.findById(id);
  }

  @Get('search/email')
  async getUserByEmail(@Query('email') user: FindUserByEmailDto) {
    return await this.usersService.findByEmail(user.email);
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  async upsertProfile(
      @CurrentUser() user: any,
      @Body() dto: CreatePatientProfileDto,
  ) {
      return this.usersService.upsertProfile(user.id, dto);
  }
}