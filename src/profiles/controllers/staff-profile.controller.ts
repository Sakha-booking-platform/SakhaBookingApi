import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { StaffProfileService } from '../services/staff-profile.service';
import { UpdateStaffProfileDto } from '../dto/update-staff-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator'; 
import { AuthGuard } from 'src/auth/guards/auth.guard';

import { ApiTags } from '@nestjs/swagger';
import { GetStaffProfileSwagger, UpdateStaffProfileSwagger } from '../decorators/profiles.swagger';

@ApiTags('Staff Profiles')
@Controller('staff/profile')
@UseGuards(AuthGuard)
export class StaffProfileController {
  constructor(private readonly staffProfileService: StaffProfileService) {}
 
  @Get() 
  @GetStaffProfileSwagger()
  async getProfile(@CurrentUser() user: any) {
    return this.staffProfileService.getProfile(user.id);
  } 

  @Put()
  @UpdateStaffProfileSwagger()
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateStaffProfileDto,
  ) {
    return this.staffProfileService.updateProfile(user.id, dto);
  }
}