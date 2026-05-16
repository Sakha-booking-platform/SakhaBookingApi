// dto/find-user-by-email.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class FindUserByEmailDto {
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب لإتمام عملية البحث' })
  @IsEmail({}, { message: 'صيغة البريد الإلكتروني المدخلة للبحث غير صحيحة' })
  email: string;
}