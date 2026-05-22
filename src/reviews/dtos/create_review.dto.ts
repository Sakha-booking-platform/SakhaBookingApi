import { IsNotEmpty, IsString, IsOptional, Min, Max, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID of the appointment', example: 1 })
  @IsNotEmpty({ message: 'Appointment ID is required to link the review to the visit' })
  @IsInt({ message: 'Appointment ID must be an integer' })
  appointmentId: number;

  @ApiProperty({ description: 'ID of the patient', example: 1 })
  @IsNotEmpty({ message: 'Patient ID is required' })
  @IsInt({ message: 'Patient ID must be an integer' })
  patientId: number;

  @ApiProperty({ description: 'Rating in stars (1-5)', example: 5, minimum: 1, maximum: 5 })
  @IsNotEmpty({ message: 'Star rating is required' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Minimum possible rating is one star (1)' })
  @Max(5, { message: 'Maximum possible rating is five stars (5)' })
  rating: number;

  @ApiPropertyOptional({ description: 'Optional comment for the review', example: 'Great doctor, very helpful!' })
  @IsOptional()
  @IsString({ message: 'Comment must be a valid string' })
  comment?: string;
}