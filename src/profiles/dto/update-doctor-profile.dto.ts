import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { DoctorStatus } from 'src/availability/enum/doctor_status';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoctorProfileDto {
  @ApiProperty({ description: 'Full name of the doctor', example: 'Dr. John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Clinic ID where the doctor works', example: 1 })
  @IsNumber()
  @IsOptional()
  clinicId?: number;

  @ApiPropertyOptional({ description: 'Doctor phone number', example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Years of medical experience', example: 10 })
  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({ description: 'Biography of the doctor', example: 'Experienced cardiologist with 10 years of practice.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Availability status of the doctor', enum: DoctorStatus, example: DoctorStatus.ACTIVE })
  @IsEnum(DoctorStatus)
  @IsOptional()
  status?: DoctorStatus;

  @ApiPropertyOptional({ description: 'Array of medical specialization IDs', type: [Number], example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  specializationIds?: number[]; // Array of medical specialization IDs for the doctor
} 