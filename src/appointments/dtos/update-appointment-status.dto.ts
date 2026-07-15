import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '../enum/appointmentStatus';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'The new status to set for the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsNotEmpty({ message: 'حالة الحجز (status) حقل مطلوب ولا يمكن تركه فارغاً' })
  @IsString({ message: 'الحالة يجب أن تكون قيمة نصية صالحة' })
  @IsEnum([AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW], {
    message: 'الحالة المرسلة غير مدعومة! يجب أن تكون حصراً إحدى القيم التالية: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW',
  })
  status: AppointmentStatus.PENDING | AppointmentStatus.CONFIRMED | AppointmentStatus.CANCELLED | AppointmentStatus.COMPLETED | AppointmentStatus.NO_SHOW;
}