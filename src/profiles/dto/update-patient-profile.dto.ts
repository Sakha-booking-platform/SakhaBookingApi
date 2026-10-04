import { IsString, IsOptional, IsEnum, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GenderEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class UpdatePatientProfileDto {
  @ApiProperty({
    description: "The patient's full name",
    example: 'Mohammed Al-Zahrani',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: "The patient's contact phone number",
    example: '+966509876543',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: "The patient's gender",
    enum: GenderEnum,
    example: GenderEnum.MALE,
  })
  @IsEnum(GenderEnum)
  @IsOptional()
  gender?: GenderEnum;

  @ApiPropertyOptional({
    description: "The patient's date of birth in ISO 8601 format (YYYY-MM-DD)",
    example: '1990-05-15',
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({
    description: "The patient's home or mailing address",
    example: 'King Abdullah Road, Riyadh',
  })
  @IsString()
  @IsOptional()
  address?: string;
}