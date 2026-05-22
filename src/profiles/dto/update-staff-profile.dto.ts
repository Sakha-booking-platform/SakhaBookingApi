import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffProfileDto {
  @ApiProperty({ description: 'Full name of the staff member', example: 'Alice Johnson' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Job position or title', example: 'Receptionist' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({ description: 'Clinic ID where the staff member works', example: 1 })
  @IsNumber()
  @IsOptional()
  clinicId?: number; // Clinic where the staff member works

  @ApiPropertyOptional({ description: 'Staff phone number', example: '+1122334455' })
  @IsString()
  @IsOptional()
  phone?: string;
}