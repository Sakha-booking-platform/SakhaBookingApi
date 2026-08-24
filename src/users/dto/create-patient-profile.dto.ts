import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../enums/genderEnum';

export class CreatePatientProfileDto {
    @ApiProperty({
        description: "The patient's full name",
        example: 'Ali Al-Hajri',
    })
    @IsString()
    fullName: string;

    @ApiPropertyOptional({
        description: "The patient's contact phone number",
        example: '+966501122334',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: "The patient's date of birth in ISO 8601 format (YYYY-MM-DD)",
        example: '1985-11-20',
    })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @ApiPropertyOptional({
        description: "The patient's gender",
        enum: Gender,
        example: Gender.MALE,
    })
    @IsOptional()
    @IsString()
    gender?: Gender;

    @ApiPropertyOptional({
        description: "The patient's residential address",
        example: 'Jeddah, Al-Safa District',
    })
    @IsOptional()
    @IsString()
    address?: string;
}