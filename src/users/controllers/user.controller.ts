import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/user.service';
import { CreateUserDto } from '../dto/create_user.dyo';
import { FindUserByEmailDto } from '../dto/find_user_by_email.dto';
import { CreatePatientProfileDto } from '../dto/create-patient-profile.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/auth/enums/userRole';
import { AuthRollGuard } from 'src/auth/guards/auth-roll.guard';
import { userRoles } from 'src/auth/decorators/user_roll.decorator';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateUserSwagger,
  GetUserByIdSwagger,
  GetUserByEmailSwagger,
  UpsertProfileSwagger,
  GetAllUsersSwagger,
} from '../decorators/users.swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @CreateUserSwagger()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get(':id')
  @GetUserByIdSwagger()
  async getUserById(@Param('id') id: String) {
    return await this.usersService.findById(id);
  }

  @Get('search/email')
  @GetUserByEmailSwagger()
  async getUserByEmail(@Query() user: FindUserByEmailDto) {
    return await this.usersService.findByEmail(user.email);
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  @UpsertProfileSwagger()
  async upsertProfile(
      @CurrentUser() user: any,
      @Body() dto: CreatePatientProfileDto,
  ) {
      return this.usersService.upsertProfile(user.id, dto);
  }


  @Get('admin/all-users')
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @GetAllUsersSwagger()
  async getAllUsers() {
    return this.usersService.findAllUsersForAdmin();
  }
}