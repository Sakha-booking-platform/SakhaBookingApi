import { IsNotEmpty, IsString, IsOptional, IsPhoneNumber, MaxLength } from 'class-validator';

export class CreateClinicDto {
  @IsString({ message: 'اسم العيادة يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'اسم العيادة مطلوب ولا يمكن تركه فارغاً' })
  @MaxLength(100, { message: 'اسم العيادة لا يجب أن يتجاوز 100 حرف' })
  name: string;

  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'عنوان العيادة مطلوب لتحديد موقعها للمرضى' })
  @MaxLength(255, { message: 'العنوان طويل جداً، يرجى الاختصار' })
  address: string | undefined;

  @IsString({ message: 'المحافظة/المدينة يجب أن تكون نصاً' })
  @IsNotEmpty({ message: 'يرجى تحديد المحافظة أو المدينة لتسهيل الفلترة والبحث' })
  @MaxLength(50, { message: 'اسم المدينة لا يجب أن يتجاوز 50 حرفاً' })
  city: string | undefined; // مثل: صنعاء، عدن، حضرموت...

  @IsPhoneNumber(null, { message: 'يرجى إدخال رقم هاتف عيادة صالح وصحيح' })
  @IsNotEmpty({ message: 'رقم هاتف العيادة مطلوب للتواصل' })
  phone: string | undefined;

  @IsString({ message: 'الوصف أو النبذة يجب أن تكون نصاً' })
  @IsOptional() // حقل اختياري
  @MaxLength(500, { message: 'النبذة التعريفية للعيادة يجب أن لا تتجاوز 500 حرف' })
  description?: string | undefined;
}