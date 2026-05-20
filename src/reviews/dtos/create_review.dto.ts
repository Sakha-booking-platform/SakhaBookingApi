import { IsNotEmpty, IsString, IsOptional, Min, Max, IsInt } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'معرف الحجز (appointmentId) مطلوب لربط التقييم بالزيارة' })
  @IsInt({ message: 'معرف الحجز يجب أن يكون رقماً صحيحاً' })
  appointmentId: number;

  @IsNotEmpty({ message: 'معرف المريض (patientId) مطلوب' })
  @IsInt({ message: 'معرف المريض يجب أن يكون رقماً صحيحاً' })
  patientId: number;

  @IsNotEmpty({ message: 'التقييم بالنجوم مطلوب' })
  @IsInt({ message: 'التقييم يجب أن يكون رقماً صحيحاً' })
  @Min(1, { message: 'أقل تقييم ممكن هو نجمة واحدة (1)' })
  @Max(5, { message: 'أعلى تقييم ممكن هو خمسة نجوم (5)' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'التعليق يجب أن يكون نصاً صالحاً' })
  comment?: string;
}