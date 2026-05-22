import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmergencyHolidayDto {
  @ApiProperty({ description: 'ID of the doctor', example: 1 })
  @IsNotEmpty({ message: 'Doctor ID is required' })
  @IsNumber({}, { message: 'Doctor ID must be a number' })
  doctorId: number;

  @ApiProperty({ description: 'ID of the clinic', example: 1 })
  @IsNotEmpty({ message: 'Clinic ID is required' })
  @IsNumber({}, { message: 'Clinic ID must be a number' })
  clinicId: number;

  @ApiProperty({ description: 'Specific date for the emergency holiday in YYYY-MM-DD format', example: '2026-05-20' })
  @IsNotEmpty({ message: 'Specific date is required' })
  @IsString({ message: 'Specific date must be a string' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in standard YYYY-MM-DD format (e.g. 2026-05-20)',
  })
  specificDate: string;

  @ApiProperty({ description: 'Reason for the emergency holiday', example: 'Personal emergency' })
  @IsNotEmpty({ message: 'Emergency reason is required' })
  @IsString({ message: 'Reason must be a string' })
  reason: string;
}