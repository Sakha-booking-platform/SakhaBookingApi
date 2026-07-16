import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create_clinic.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { AuthRollGuard } from 'src/auth/guards/auth-roll.guard';
import { UserRole } from 'src/auth/enums/userRole';
import { userRoles } from 'src/auth/decorators/user_roll.decorator';
import {
  DocGetAllClinics,
  DocGetClinicDetails,
  DocGetAllSpecializations,
  DocCreateClinic,
  DocCreateSpecialization,
} from './clinics.docs';

@ApiTags('Clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  // ── Public Endpoints ────────────────────────────────────────

  @Get()
  @DocGetAllClinics()
  async getAllClinics() {
    return this.clinicsService.findAllClinics();
  }

  @Get('specializations/all')
  @DocGetAllSpecializations()
  async getAllSpecializations() {
    return this.clinicsService.findAllSpecializations();
  }

  @Get(':id')
  @DocGetClinicDetails()
  async getClinicDetails(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.findClinicDetails(id);
  }

  // ── Admin Endpoints ─────────────────────────────────────────

  @Post()
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @DocCreateClinic()
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicsService.createClinic(createClinicDto);
  }

  @Post('specializations')
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @DocCreateSpecialization()
  async createSpecialization(@Body() createSpecDto: CreateSpecializationDto) {
    return this.clinicsService.createSpecialization(createSpecDto);
  }
}