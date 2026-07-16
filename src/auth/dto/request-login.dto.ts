import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enums/userRole';

export class RequestLoginDto {
  @ApiProperty({
    description: 'The email address to send the magic login link to',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'يرجى إدخال بريد إلكتروني صالح' })
  email: string;

  @ApiPropertyOptional({
    description: 'The role of the user requesting login. Defaults to PATIENT if not provided.',
    enum: UserRole,
    example: UserRole.PATIENT,
    default: UserRole.PATIENT,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'دور المستخدم غير صالح' })
  role: UserRole = UserRole.PATIENT;
}