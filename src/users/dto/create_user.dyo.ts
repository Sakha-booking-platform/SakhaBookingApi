// dto/create-user.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address for the new user',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب ولا يمكن تركه فارغاً' })
  @IsString({ message: 'البريد الإلكتروني يجب أن يكون نصاً' })
  @IsEmail({}, { message: 'صيغة البريد الإلكتروني غير صحيحة' })
  email: string;
}