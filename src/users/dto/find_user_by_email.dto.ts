// dto/find-user-by-email.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindUserByEmailDto {
  @ApiProperty({
    description: 'The email address to search for',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب لإتمام عملية البحث' })
  @IsEmail({}, { message: 'صيغة البريد الإلكتروني المدخلة للبحث غير صحيحة' })
  email: string;
}