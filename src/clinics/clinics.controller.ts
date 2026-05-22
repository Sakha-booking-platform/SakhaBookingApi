import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create_clinic.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { AuthRollGuard } from 'src/auth/guards/auth-roll.guard';
import { UserRole } from 'src/auth/enums/userRole';
import { userRoles } from 'src/auth/decorators/user_roll.decorator';
import { ApiTags } from '@nestjs/swagger';
import { 
  GetAllClinicsSwagger, 
  GetClinicDetailsSwagger, 
  GetAllSpecializationsSwagger, 
  CreateClinicSwagger, 
  CreateSpecializationSwagger 
} from './decorators/clinics.swagger';

@ApiTags('Clinics')
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  // ==========================================
  // 🔓 المسارات العامة (Public Endpoints)
  // ==========================================

  /**
   * جلب جميع العيادات المتوفرة في المنصة
   * متاح للجميع (مرضى، زوار) لاستكشاف العيادات
   */
  @Get()
  @GetAllClinicsSwagger()
  async getAllClinics() {
    return this.clinicsService.findAllClinics();
  }

  /**
   * جلب تفاصيل عيادة معينة بناءً على الـ ID الخاص بها
   * (يعيد تفاصيل العيادة مع الأطباء التابعين لها)
   */
  @Get(':id')
  @GetClinicDetailsSwagger()
  async getClinicDetails(@Param('id', ParseIntPipe) id: number) {
    return this.clinicsService.findClinicDetails(id);
  }

  /**
   * جلب جميع التخصصات الطبية المتوفرة في النظام
   * يحتاجها الـ Frontend لعرضها في قوائم الفلترة والبحث
   */
  @Get('specializations/all')
  @GetAllSpecializationsSwagger()
  async getAllSpecializations() {
    return this.clinicsService.findAllSpecializations();
  }


  // ==========================================
  // 🔒 مسارات الإدارة (Admin/Protected Endpoints)
  // ==========================================

  /**
   * إنشاء عيادة جديدة في النظام
   * مسموح فقط للمدراء (Admin)
   */
  @Post()
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @CreateClinicSwagger()
  async createClinic(@Body() createClinicDto: CreateClinicDto) {
    return this.clinicsService.createClinic(createClinicDto);
  }

  /**
   * إضافة تخصص طبي جديد للنظام (مثل: طب العيون، جراحة الأعصاب)
   * مسموح فقط للمدراء (Admin)
   */
  @Post('specializations')
  @UseGuards(AuthRollGuard)
  @userRoles(UserRole.ADMIN)
  @CreateSpecializationSwagger()
  async createSpecialization(@Body() createSpecDto: CreateSpecializationDto) {
    return this.clinicsService.createSpecialization(createSpecDto);
  }
}