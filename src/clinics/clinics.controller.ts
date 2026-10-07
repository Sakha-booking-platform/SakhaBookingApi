import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
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
  async getAllClinics(@Query('page') page: string = '1') {
    const pageNum = parseInt(page, 10) || 1;
    return this.clinicsService.findAllClinics(pageNum);
  }

  @Get('specializations/all')
  @DocGetAllSpecializations()
  async getAllSpecializations() {
    return this.clinicsService.findAllSpecializations();
  }

  @Get('nearby')
  async getNearbyClinics(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.clinicsService.findNearbyClinics(parseFloat(lat), parseFloat(lng));
  }

  @Get('search')
  async searchClinics(@Query('query') query: string, @Query('page') page: string = '1') {
    const pageNum = parseInt(page, 10) || 1;
    if (!query) {
      return this.clinicsService.findAllClinics(pageNum);
    }
    return this.clinicsService.searchClinics(query, pageNum);
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