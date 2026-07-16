import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/user.service';
import { CreateUserDto } from '../dto/create_user.dyo';
import { FindUserByEmailDto } from '../dto/find_user_by_email.dto';
import { CreatePatientProfileDto } from '../dto/create-patient-profile.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserRole } from 'src/auth/enums/userRole';
import { AuthRollGuard } from 'src/auth/guards/auth-roll.guard';
import { userRoles } from 'src/auth/decorators/user_roll.decorator';
import {
  DocCreateUser,
  DocGetUserById,
  DocGetUserByEmail,
  DocUpsertPatientProfile,
  DocGetAllUsersForAdmin,
} from '../users.docs';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==========================================
  // Static Routes (must be defined before parameterized routes like :id)
  // ==========================================

  @Get('search/email')
  @DocGetUserByEmail()
  async getUserByEmail(@Query() query: FindUserByEmailDto) {
    return await this.usersService.findByEmail(query.email);
  }

  @Get('admin/all-users')
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @DocGetAllUsersForAdmin()
  async getAllUsers() {
    return this.usersService.findAllUsersForAdmin();
  }

  @Post('profile')
  @UseGuards(AuthGuard)
  @DocUpsertPatientProfile()
  async upsertProfile(
    @CurrentUser() user: any,
    @Body() dto: CreatePatientProfileDto,
  ) {
    return this.usersService.upsertProfile(user.id, dto);
  }

  // ==========================================
  // Dynamic/Base Routes
  // ==========================================

  @Post()
  @DocCreateUser()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get(':id')
  @DocGetUserById()
  async getUserById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }
}