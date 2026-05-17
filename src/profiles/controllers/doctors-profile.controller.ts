import { Controller, Get, Body, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { DoctorsProfileService } from '../services/doctors-profile.service';
import { UpdateDoctorProfileDto } from '../dto/update-doctor-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator'; 
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { FlattenDoctorProfileInterceptor } from '../interceptors/flatten-doctor-profile.interceptor'; 
 
@Controller('doctors/profile')
@UseGuards(AuthGuard)
export class DoctorsProfileController {
  constructor(private readonly doctorsProfileService: DoctorsProfileService) {}

  @Get()
@UseInterceptors(FlattenDoctorProfileInterceptor)
  async getProfile(@CurrentUser() user: any) {
    return this.doctorsProfileService.getProfile(user.id);
  }

  @Put()
  async updateProfile( 
    @CurrentUser() user: any,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsProfileService.updateProfile(user.id, dto);
  }
}