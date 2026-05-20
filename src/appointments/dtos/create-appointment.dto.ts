import { IsNotEmpty, IsNumber, IsString, IsOptional, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty({ message: 'معرف المريض (patientId) حقل مطلوب' })
  @IsNumber({}, { message: 'معرف المريض يجب أن يكون رقماً صحيحاً' })
  patientId: number;

  @IsNotEmpty({ message: 'معرف الطبيب (doctorId) حقل مطلوب' })
  @IsNumber({}, { message: 'معرف الطبيب يجب أن يكون رقماً صحيحاً' })
  doctorId: number;

  @IsNotEmpty({ message: 'معرف العيادة (clinicId) حقل مطلوب' })
  @IsNumber({}, { message: 'معرف العيادة يجب أن يكون رقماً صحيحاً' })
  clinicId: number;

  @IsNotEmpty({ message: 'تاريخ الحجز (appointmentDate) حقل مطلوب' })
  @IsString({ message: 'التاريخ يجب أن يكون نصاً صالحاً' })
  // تعبير نمطي للتأكد من إرسال التاريخ بصيغة سليم YYYY-MM-DD مثل 2026-05-20
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'التاريخ يجب أن يكون بالصيغة القياسية YYYY-MM-DD' })
  appointmentDate: string;

  @IsNotEmpty({ message: 'وقت الحجز (appointmentTime) حقل مطلوب' })
  @IsString({ message: 'الوقت يجب أن يكون نصاً صالحاً' })
  // تعبير نمطي للتأكد من إرسال الوقت بصيغة HH:MM:SS (ساعة:دقيقة:ثانية) متوافق مع نوع time في Postgres
  @Matches(/^\d{2}:\d{2}:\d{2}$/, { message: 'الوقت يجب أن يكون بالصيغة القياسية أربعة وعشرون ساعة HH:MM:SS' })
  appointmentTime: string;

  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  paymentAttachment?: string;
}