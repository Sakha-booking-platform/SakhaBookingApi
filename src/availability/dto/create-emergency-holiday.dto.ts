import { IsNotEmpty, IsNumber, IsString, Matches } from 'class-validator';

export class CreateEmergencyHolidayDto {
  @IsNotEmpty({ message: 'معرف الطبيب مطلوب' })
  @IsNumber({}, { message: 'معرف الطبيب يجب أن يكون رقماً' })
  doctorId: number;

  @IsNotEmpty({ message: 'معرف العيادة مطلوب' })
  @IsNumber({}, { message: 'معرف العيادة يجب أن يكون رقماً' })
  clinicId: number;

  @IsNotEmpty({ message: 'التاريخ المحدّد مطلوب' })
  @IsString({ message: 'التاريخ يجب أن يكون نصاً' })
  // 🛡️ تعبير نمطي (Regex) يضمن أن يرسل الفرونت إند التاريخ بصيغة YYYY-MM-DD حصراً
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'التاريخ يجب أن يكون بالصيغة الصحيحة YYYY-MM-DD مثل 2026-05-20',
  })
  specificDate: string;

  @IsNotEmpty({ message: 'سبب الإجازة الطارئة مطلوب' })
  @IsString({ message: 'السبب يجب أن يكون نصاً' })
  reason: string;
}