import { IsString, IsOptional, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class UpdatePatientProfileDto {
  @ApiProperty({ description: 'Full name of the patient', example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Patient phone number', example: '+1987654321' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Gender of the patient', enum: GenderEnum, example: GenderEnum.FEMALE })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @ApiPropertyOptional({ description: 'Date of birth in ISO format', example: '1995-05-15' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Physical address of the patient', example: '123 Main St, Springfield' })
  @IsString()
  @IsOptional()
  address?: string;
}