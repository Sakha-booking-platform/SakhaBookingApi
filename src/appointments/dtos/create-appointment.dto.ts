import { IsNotEmpty, IsNumber, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID of the patient', example: 1 })
  @IsNotEmpty({ message: 'Patient ID (patientId) is required' })
  @IsNumber({}, { message: 'Patient ID must be a valid number' })
  patientId: number;

  @ApiProperty({ description: 'ID of the doctor', example: 2 })
  @IsNotEmpty({ message: 'Doctor ID (doctorId) is required' })
  @IsNumber({}, { message: 'Doctor ID must be a valid number' })
  doctorId: number;

  @ApiProperty({ description: 'ID of the clinic', example: 1 })
  @IsNotEmpty({ message: 'Clinic ID (clinicId) is required' })
  @IsNumber({}, { message: 'Clinic ID must be a valid number' })
  clinicId: number;

  @ApiProperty({ description: 'Date of the appointment in YYYY-MM-DD format', example: '2026-05-20' })
  @IsNotEmpty({ message: 'Appointment date (appointmentDate) is required' })
  @IsString({ message: 'Appointment date must be a valid string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Appointment date must be in standard YYYY-MM-DD format' })
  appointmentDate: string;

  @ApiProperty({ description: 'Time of the appointment in HH:MM:SS format', example: '14:30:00' })
  @IsNotEmpty({ message: 'Appointment time (appointmentTime) is required' })
  @IsString({ message: 'Appointment time must be a valid string' })
  @Matches(/^\d{2}:\d{2}:\d{2}$/, { message: 'Appointment time must be in standard 24-hour HH:MM:SS format' })
  appointmentTime: string;

  @ApiPropertyOptional({ description: 'Additional notes for the appointment', example: 'First visit' })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Payment reference number if prepayment is required', example: 'REF123456' })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({ description: 'Payment attachment URL or path', example: '/uploads/receipt.png' })
  @IsOptional()
  @IsString()
  paymentAttachment?: string;
}