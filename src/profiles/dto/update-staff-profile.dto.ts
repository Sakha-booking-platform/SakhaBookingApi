import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateStaffProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsNumber()
  @IsOptional()
  clinicId?: number; // لربط موظف الاستقبال بالعيادة التي يعمل بها

  @IsString()
  @IsOptional()
  phone?: string;
}