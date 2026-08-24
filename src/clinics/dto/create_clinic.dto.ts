import { IsNotEmpty, IsString, IsOptional, IsPhoneNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty({
    description: 'The official name of the clinic',
    example: 'Al-Noor Medical Center',
    maxLength: 100,
  })
  @IsString({ message: 'اسم العيادة يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم العيادة مطلوب ولا يمكن تركه فارغاً' })
  @MaxLength(100, { message: 'اسم العيادة لا يجب أن يتجاوز 100 حرف' })
  name: string;

  @ApiProperty({
    description: 'The full street address of the clinic',
    example: 'King Fahd Road, Al-Olaya District',
    maxLength: 255,
  })
  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'عنوان العيادة مطلوب لتحديد موقعها للمرضى' })
  @MaxLength(255, { message: 'العنوان طويل جداً، يرجى الاختصار' })
  address: string;

  @ApiProperty({
    description: 'The city or governorate where the clinic is located. Used for filtering and search.',
    example: 'Riyadh',
    maxLength: 50,
  })
  @IsString({ message: 'المحافظة/المدينة يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'يرجى تحديد المحافظة أو المدينة لتسهيل الفلترة والبحث' })
  @MaxLength(50, { message: 'اسم المدينة لا يجب أن يتجاوز 50 حرفاً' })
  city: string;

  @ApiProperty({
    description: 'The clinic contact phone number (Yemeni format)',
    example: '+967712345678',
  })
  @IsPhoneNumber('YE', { message: 'يرجى إدخال رقم هاتف عيادة صالح وصحيح' })
  @IsNotEmpty({ message: 'رقم هاتف العيادة مطلوب للتواصل' })
  phone: string;

  @ApiPropertyOptional({
    description: 'A short description or introduction about the clinic (optional)',
    example: 'A leading medical center specializing in cardiology and internal medicine since 2005.',
    maxLength: 500,
  })
  @IsString({ message: 'الوصف أو النبذة يجب أن تكون نصاً' })
  @IsOptional()
  @MaxLength(500, { message: 'النبذة التعريفية للعيادة يجب أن لا تتجاوز 500 حرف' })
  description?: string;
}