import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../enums/userRole';

export class RequestLoginDto {
  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صالح' })
  email: string;

  @IsOptional() 
  @IsEnum(UserRole, { message: 'دور المستخدم غير صالح' }) // 
  role: UserRole = UserRole.PATIENT; 
}