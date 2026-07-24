import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: 'The updated appointment date in YYYY-MM-DD format',
    example: '2026-08-20',
    pattern: '^\\d{4}-\\d{2}-\\d{2}$',
  })
  @IsOptional()
  @IsString({ message: 'تاريخ الحجز يجب أن يكون نصاً صالحاً' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'التاريخ يجب أن يكون بالصيغة القياسية YYYY-MM-DD',
  })
  appointmentDate?: string;

  @ApiPropertyOptional({
    description: 'The updated appointment time in 24-hour HH:MM:SS format',
    example: '10:30:00',
    pattern: '^\\d{2}:\\d{2}:\\d{2}$',
  })
  @IsOptional()
  @IsString({ message: 'وقت الحجز يجب أن يكون نصاً صالحاً' })
  @Matches(/^\d{2}:\d{2}:\d{2}$/, {
    message: 'الوقت يجب أن يكون بالصيغة القياسية أربعة وعشرون ساعة HH:MM:SS',
  })
  appointmentTime?: string;

  @ApiPropertyOptional({
    description: 'Optional notes or special requests for the appointment',
    example: 'Please bring previous medical reports',
  })
  @IsOptional()
  @IsString({ message: 'الملاحظات يجب أن تكون نصاً' })
  notes?: string;
}
