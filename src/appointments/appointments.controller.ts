import { 
  Controller, 
  Post, 
  Body, 
  HttpStatus, 
  HttpCode, 
  UsePipes, 
  ValidationPipe, 
  Get,
  Patch,
  Param,
  ParseIntPipe
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dtos/update-appointment-status.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED) // يُرجع التقييم التلقائي 21 Created في حال النجاح
  @UsePipes(new ValidationPipe({ 
    whitelist: true, // يتجاهل أي حقول زائدة وغير معرفة في الـ DTO لحماية السيرفر
    forbidNonWhitelisted: true, // يرفض الطلب تماماً إذا أرسل الموبايل حقولاً غريبة
    transform: true // يحول الأنواع تلقائياً إذا لزم الأمر
  }))
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.bookAppointment(dto);
  }


  // 1. جلب حجوزات المريض
  @Get('patient/:patientId')
  async getPatientAppointments(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.appointmentsService.getPatientAppointments(patientId);
  }

  // 2. جلب حجوزات الطبيب
  @Get('doctor/:doctorId')
  async getDoctorAppointments(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.appointmentsService.getDoctorAppointments(doctorId);
  }

  // 3. تحديث حالة الحجز (تأكيد / إلغاء / إلخ)
  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(id, dto);
  }

  @Get(':id')
async getAppointmentById(@Param('id', ParseIntPipe) id: number) {
  return this.appointmentsService.getAppointmentById(id);
}

// 2. جلب حجوزات عيادة معينة لوظفي الاستقبال
@Get('clinic/:clinicId')
async getClinicAppointments(@Param('clinicId', ParseIntPipe) clinicId: number) {
  return this.appointmentsService.getClinicAppointments(clinicId);
}
    
}