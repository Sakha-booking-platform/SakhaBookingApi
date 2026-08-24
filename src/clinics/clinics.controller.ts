import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create_clinic.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { AuthRollGuard } from 'src/auth/guards/auth-roll.guard';
import { UserRole } from 'src/auth/enums/userRole';
import { userRoles } from 'src/auth/decorators/user_roll.decorator';
import { DocGetClinicDetails, DocCreateClinic, DocCreateSpecialization } from './clinics.docs';
import { ListClinicsQueryDto } from './dto/list-clinics-query.dto';
import { SearchClinicsQueryDto } from './dto/search-clinics-query.dto';
import { NearbyClinicsQueryDto } from './dto/nearby-clinics-query.dto';

@ApiTags('Home Discovery — Clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  @ApiOperation({ summary: 'Clinics' })
  @ApiOkResponse()
  getAllClinics(@Query() query: ListClinicsQueryDto) {
    return this.clinicsService.findAllClinics(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Clinics search' })
  @ApiOkResponse()
  searchClinics(@Query() query: SearchClinicsQueryDto) {
    return this.clinicsService.searchClinics(query);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Nearby clinics' })
  @ApiOkResponse()
  getNearbyClinics(@Query() query: NearbyClinicsQueryDto) {
    return this.clinicsService.findNearbyClinics(query);
  }

  @Get('specializations/all')
  @ApiOperation({ summary: 'Specializations' })
  @ApiOkResponse()
  getAllSpecializations() {
    return this.clinicsService.findAllSpecializations();
  }

  @Get(':id')
  @DocGetClinicDetails()
  getClinicDetails(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.findClinicDetails(id);
  }

  @Post()
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @DocCreateClinic()
  createClinic(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicsService.createClinic(createClinicDto);
  }

  @Post('specializations')
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @DocCreateSpecialization()
  createSpecialization(@Body() createSpecDto: CreateSpecializationDto) {
    return this.clinicsService.createSpecialization(createSpecDto);
  }
}