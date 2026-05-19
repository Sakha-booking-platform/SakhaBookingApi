import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsNotEmpty } from 'class-validator';
import { DoctorStatus } from 'src/availability/enum/doctor_status';



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

  @IsEnum(DoctorStatus)
  @IsOptional()
  status?: DoctorStatus;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  specializationIds?: number[]; // مصفوفة تحتوي على معرفات التخصصات الطبية للطبيب
}