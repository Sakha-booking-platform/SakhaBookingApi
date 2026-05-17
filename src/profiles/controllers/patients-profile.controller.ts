import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { PatientsProfileService } from '../services/patients-profile.service';
import { UpdatePatientProfileDto } from '../dto/update-patient-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator'; // ديكوريتور لاستخراج بيانات المستخدم من الطلب
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('patients/profile')
@UseGuards(AuthGuard)
export class PatientsProfileController {
  constructor(private readonly patientsProfileService: PatientsProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: any) {
    return this.patientsProfileService.getProfile(user.id);
  }

  @Put()
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return this.patientsProfileService.updateProfile(user.id, dto);
  }
}