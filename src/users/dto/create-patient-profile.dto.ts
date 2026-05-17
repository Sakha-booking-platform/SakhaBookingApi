import { IsString, IsOptional, IsDateString } from 'class-validator';
import { Gender } from '../enums/genderEnum';

export class CreatePatientProfileDto {
    @IsString()
    fullName: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    gender?: Gender;

    @IsOptional()
    @IsString()
    address?: string;
}