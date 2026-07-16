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
import { ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dtos/update-appointment-status.dto';
import {
  DocCreateAppointment,
  DocGetPatientAppointments,
  DocGetDoctorAppointments,
  DocUpdateAppointmentStatus,
  DocGetAppointmentById,
  DocGetClinicAppointments,
} from './appointments.docs';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  @DocCreateAppointment()
  async createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.bookAppointment(dto);
  }

  @Get('patient/:patientId')
  @DocGetPatientAppointments()
  async getPatientAppointments(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.appointmentsService.getPatientAppointments(patientId);
  }

  @Get('doctor/:doctorId')
  @DocGetDoctorAppointments()
  async getDoctorAppointments(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.appointmentsService.getDoctorAppointments(doctorId);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @DocUpdateAppointmentStatus()
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(id, dto);
  }

  @Get(':id')
  @DocGetAppointmentById()
  async getAppointmentById(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.getAppointmentById(id);
  }

  @Get('clinic/:clinicId')
  @DocGetClinicAppointments()
  async getClinicAppointments(@Param('clinicId', ParseIntPipe) clinicId: number) {
    return this.appointmentsService.getClinicAppointments(clinicId);
  }
}