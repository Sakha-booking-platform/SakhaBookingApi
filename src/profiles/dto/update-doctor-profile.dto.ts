import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsNotEmpty } from 'class-validator';

export enum DoctorStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export class UpdateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsNumber()
  @IsOptional()
  clinicId?: number;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsEnum(DoctorStatusEnum)
  @IsOptional()
  status?: DoctorStatusEnum;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  specializationIds?: number[]; // مصفوفة تحتوي على معرفات التخصصات الطبية للطبيب
}