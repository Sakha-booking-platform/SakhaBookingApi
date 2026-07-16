import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StaffProfileService } from '../services/staff-profile.service';
import { UpdateStaffProfileDto } from '../dto/update-staff-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { DocGetStaffProfile, DocUpdateStaffProfile } from '../profiles.docs';

@ApiTags('Profiles — Staff')
@UseGuards(AuthGuard)
@Controller('staff/profile')
export class StaffProfileController {
  constructor(private readonly staffProfileService: StaffProfileService) {}

  @Get()
  @DocGetStaffProfile()
  async getProfile(@CurrentUser() user: any) {
    return this.staffProfileService.getProfile(user.id);
  }

  @Put()
  @DocUpdateStaffProfile()
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateStaffProfileDto,
  ) {
    return this.staffProfileService.updateProfile(user.id, dto);
  }
}