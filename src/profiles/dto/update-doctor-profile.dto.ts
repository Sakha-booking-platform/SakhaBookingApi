import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DoctorStatus } from 'src/availability/enum/doctor_status';

export class UpdateDoctorProfileDto {
  @ApiProperty({
    description: "The doctor's full name",
    example: 'Dr. Ahmed Al-Farsi',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: 'The ID of the primary clinic the doctor is associated with',
    example: 2,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  clinicId?: number;

  @ApiPropertyOptional({
    description: "The doctor's contact phone number",
    example: '+966501234567',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Number of years of professional experience',
    example: 12,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @ApiPropertyOptional({
    description: 'A short professional bio displayed on the doctor profile page',
    example: 'Specialist in internal medicine with 12 years of experience in cardiology and general medicine.',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: "The doctor's current activity status on the platform",
    enum: DoctorStatus,
    example: DoctorStatus.ACTIVE,
  })
  @IsEnum(DoctorStatus)
  @IsOptional()
  status?: DoctorStatus;

  @ApiPropertyOptional({
    description: 'Array of specialization IDs to assign to the doctor. Replaces all existing specializations.',
    type: [Number],
    example: [1, 4, 7],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  specializationIds?: number[];
}