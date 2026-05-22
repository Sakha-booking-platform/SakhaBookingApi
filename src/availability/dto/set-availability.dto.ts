import { IsArray, ValidateNested, IsNumber, IsString, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AvailabilityItemDto {
  @ApiProperty({ description: 'ID of the doctor', example: 1 })
  @IsNumber()
  doctorId: number;

  @ApiProperty({ description: 'ID of the clinic', example: 1 })
  @IsNumber()
  clinicId: number;

  @ApiProperty({ description: 'Day of the week (0 = Sunday, 1 = Monday, etc.)', example: 1 })
  @IsNumber()
  dayOfWeek: number;

  @ApiProperty({ description: 'Start time in HH:mm format', example: '09:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'startTime must be a valid time in HH:mm format' })
  startTime: string;

  @ApiProperty({ description: 'End time in HH:mm format', example: '14:00' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'endTime must be a valid time in HH:mm format' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Maximum number of patients for this period', example: 20 })
  @IsNumber()
  @IsOptional()
  maxPatients?: number;
}

export class SetAvailabilityDto {
  @ApiProperty({ type: [AvailabilityItemDto], description: 'List of availability slots' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityItemDto)
  availability: AvailabilityItemDto[];
}
