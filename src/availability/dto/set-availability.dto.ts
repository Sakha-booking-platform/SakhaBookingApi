import { IsArray, ValidateNested, IsNumber, IsString, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilityItemDto {
  @IsNumber()
  doctorId: number;

  @IsNumber()
  clinicId: number;

  @IsNumber()
  dayOfWeek: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'startTime must be a valid time in HH:mm format' })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, { message: 'endTime must be a valid time in HH:mm format' })
  endTime: string;

  @IsNumber()
  @IsOptional()
  maxPatients?: number;
}

export class SetAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityItemDto)
  availability: AvailabilityItemDto[];
}
