// dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب ولا يمكن تركه فارغاً' })
  @IsString({ message: 'البريد الإلكتروني يجب أن يكون نصاً' })
  @IsEmail({}, { message: 'صيغة البريد الإلكتروني غير صحيحة' })
  email: string;
}