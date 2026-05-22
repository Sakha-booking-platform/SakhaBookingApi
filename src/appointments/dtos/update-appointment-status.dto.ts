import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../enum/appointmentStatus';

export class UpdateAppointmentStatusDto {
  @ApiProperty({ description: 'New status for the appointment', enum: AppointmentStatus, example: AppointmentStatus.CONFIRMED })
  @IsNotEmpty({ message: 'Appointment status (status) is required and cannot be empty' })
  @IsString({ message: 'Status must be a valid string' })
  @IsEnum([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW], {
    message: 'Unsupported status! Must be one of: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW',
  })
  status: AppointmentStatus.PENDING | AppointmentStatus.CONFIRMED | AppointmentStatus.CANCELLED | AppointmentStatus.COMPLETED | AppointmentStatus.NO_SHOW;
}