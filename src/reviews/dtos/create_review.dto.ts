import { IsNotEmpty, IsString, IsOptional, Min, Max, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({
    description: 'The ID of the completed appointment this review is linked to. The appointment must have status COMPLETED.',
    example: 42,
    type: Number,
  })
  @IsNotEmpty({ message: 'معرف الحجز (appointmentId) مطلوب لربط التقييم بالزيارة' })
  @IsInt({ message: 'معرف الحجز يجب أن يكون رقماً صحيحاً' })
  appointmentId: number;

  @ApiProperty({
    description: 'The ID of the patient submitting the review. Must match the patient on the appointment.',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'معرف المريض (patientId) مطلوب' })
  @IsInt({ message: 'معرف المريض يجب أن يكون رقماً صحيحاً' })
  patientId: number;

  @ApiProperty({
    description: 'Star rating from 1 (lowest) to 5 (highest)',
    example: 5,
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  @IsNotEmpty({ message: 'التقييم بالنجوم مطلوب' })
  @IsInt({ message: 'التقييم يجب أن يكون رقماً صحيحاً' })
  @Min(1, { message: 'أقل تقييم ممكن هو نجمة واحدة (1)' })
  @Max(5, { message: 'أعلى تقييم ممكن هو خمسة نجوم (5)' })
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional written comment or feedback from the patient about the visit',
    example: 'Very professional and knowledgeable doctor. Highly recommended!',
  })
  @IsOptional()
  @IsString({ message: 'التعليق يجب أن يكون نصاً صالحاً' })
  comment?: string;
}