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
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { 
  CreateAppointmentSwagger, 
  GetPatientAppointmentsSwagger, 
  GetDoctorAppointmentsSwagger, 
  UpdateAppointmentStatusSwagger, 
  GetAppointmentByIdSwagger, 
  GetClinicAppointmentsSwagger 
} from './decorators/appointments.swagger';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED) // يُرجع التقييم التلقائي 21 Created في حال النجاح
  @CreateAppointmentSwagger()
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.bookAppointment(dto);
  }


  // 1. جلب حجوزات المريض
  @Get('patient/:patientId')
  @GetPatientAppointmentsSwagger()
  async getPatientAppointments(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.appointmentsService.getPatientAppointments(patientId);
  }

  // 2. جلب حجوزات الطبيب
  @Get('doctor/:doctorId')
  @GetDoctorAppointmentsSwagger()
  async getDoctorAppointments(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.appointmentsService.getDoctorAppointments(doctorId);
  }

  // 3. تحديث حالة الحجز (تأكيد / إلغاء / إلخ)
  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UpdateAppointmentStatusSwagger()
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(id, dto);
  }

  @Get(':id')
  @GetAppointmentByIdSwagger()
async getAppointmentById(@Param('id', ParseIntPipe) id: number) {
  return this.appointmentsService.getAppointmentById(id);
}

// 2. جلب حجوزات عيادة معينة لوظفي الاستقبال
@Get('clinic/:clinicId')
@GetClinicAppointmentsSwagger()
async getClinicAppointments(@Param('clinicId', ParseIntPipe) clinicId: number) {
  return this.appointmentsService.getClinicAppointments(clinicId);
}
    
}