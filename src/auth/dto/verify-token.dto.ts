import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({ description: 'رمز التحقق (OTP) أو التوكن', example: '123456' })
  @IsString()
  token: string;
}