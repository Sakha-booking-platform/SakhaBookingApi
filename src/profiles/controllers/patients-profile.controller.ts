import { Controller, Get, Body, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PatientsProfileService } from '../services/patients-profile.service';
import { UpdatePatientProfileDto } from '../dto/update-patient-profile.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { DocGetPatientProfile, DocUpdatePatientProfile } from '../profiles.docs';

@ApiTags('Profiles — Patient')
@UseGuards(AuthGuard)
@Controller('patients/profile')
export class PatientsProfileController {
  constructor(private readonly patientsProfileService: PatientsProfileService) {}

  @Get()
  @DocGetPatientProfile()
  async getProfile(@CurrentUser() user: any) {
    return this.patientsProfileService.getProfile(user.id);
  }

  @Put()
  @DocUpdatePatientProfile()
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdatePatientProfileDto,
  ) {
    return this.patientsProfileService.updateProfile(user.id, dto);
  }
}