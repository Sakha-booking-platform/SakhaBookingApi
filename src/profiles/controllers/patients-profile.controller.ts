import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { PatientsProfileService } from '../services/patients-profile.service';
import { UpdatePatientProfileDto } from '../dto/update-patient-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator'; // ديكوريتور لاستخراج بيانات المستخدم من الطلب
import { AuthGuard } from 'src/auth/guards/auth.guard';

import { ApiTags } from '@nestjs/swagger';
import { GetPatientProfileSwagger, UpdatePatientProfileSwagger } from '../decorators/profiles.swagger';

@ApiTags('Patient Profiles')
@Controller('patients/profile')
@UseGuards(AuthGuard)
export class PatientsProfileController {
  constructor(private readonly patientsProfileService: PatientsProfileService) {}

  @Get()
  @GetPatientProfileSwagger()
  async getProfile(@CurrentUser() user: any) {
    return this.patientsProfileService.getProfile(user.id);
  }

  @Put()
  @UpdatePatientProfileSwagger()
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return this.patientsProfileService.updateProfile(user.id, dto);
  }
}