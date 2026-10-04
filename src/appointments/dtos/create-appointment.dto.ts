import { IsNotEmpty, IsNumber, IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'The unique ID of the patient booking the appointment',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'معرف المريض (patientId) حقل مطلوب' })
  @IsNumber({}, { message: 'معرف المريض يجب أن يكون رقماً صحيحاً' })
  patientId: number;

  @ApiProperty({
    description: 'The unique ID of the doctor the patient is booking with',
    example: 3,
    type: Number,
  })
  @IsNotEmpty({ message: 'معرف الطبيب (doctorId) حقل مطلوب' })
  @IsNumber({}, { message: 'معرف الطبيب يجب أن يكون رقماً صحيحاً' })
  doctorId: number;

  @ApiProperty({
    description: 'The unique ID of the clinic where the appointment will take place',
    example: 2,
    type: Number,
  })
  @IsNotEmpty({ message: 'معرف العيادة (clinicId) حقل مطلوب' })
  @IsNumber({}, { message: 'معرف العيادة يجب أن يكون رقماً صحيحاً' })
  clinicId: number;

  @ApiProperty({
    description: 'The desired appointment date in YYYY-MM-DD format',
    example: '2026-08-20',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsNotEmpty({ message: 'تاريخ الحجز (appointmentDate) حقل مطلوب' })
  @IsString({ message: 'التاريخ يجب أن يكون نصاً صالحاً' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'التاريخ يجب أن يكون بالصيغة القياسية YYYY-MM-DD' })
  appointmentDate: string;

  @ApiProperty({
    description: 'The desired appointment time in 24-hour HH:MM:SS format',
    example: '10:30:00',
    pattern: '^\\d{2}:\\d{2}:\\d{2}$',
  })
  @IsNotEmpty({ message: 'وقت الحجز (appointmentTime) حقل مطلوب' })
  @IsString({ message: 'الوقت يجب أن يكون نصاً صالحاً' })
  @Matches(/^\d{2}:\d{2}:\d{2}$/, { message: 'الوقت يجب أن يكون بالصيغة القياسية أربعة وعشرون ساعة HH:MM:SS' })
  appointmentTime: string;

  @ApiPropertyOptional({
    description: 'Optional notes or special requests from the patient for the doctor',
    example: 'I have an allergy to penicillin',
  })
  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Payment transfer reference number (required if the clinic requires prepayment)',
    example: 'TXN-20260820-987654',
  })
  @IsOptional()
  @IsString()
  paymentReference?: string;

  @ApiPropertyOptional({
    description: 'URL or path to the payment receipt/attachment (required if the clinic requires prepayment)',
    example: 'https://cdn.example.com/receipts/receipt_987654.jpg',
  })
  @IsOptional()
  @IsString()
  paymentAttachment?: string;
}