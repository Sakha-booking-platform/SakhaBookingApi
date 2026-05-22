import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../enums/userRole';

export class RequestLoginDto {
  @ApiProperty({ description: 'البريد الإلكتروني للمستخدم', example: 'user@example.com' })
  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صالح' })
  email: string;

  @ApiProperty({ description: 'دور المستخدم', enum: UserRole, default: UserRole.PATIENT, required: false })
  @IsOptional() 
  @IsEnum(UserRole, { message: 'دور المستخدم غير صالح' }) // 
  role: UserRole = UserRole.PATIENT; 
}