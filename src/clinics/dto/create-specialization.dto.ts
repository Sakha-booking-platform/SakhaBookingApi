import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecializationDto {
  @ApiProperty({
    description: 'The name of the medical specialization',
    example: 'Cardiology',
    maxLength: 100,
  })
  @IsString({ message: 'اسم التخصص يجب أن يكون نصاً مراجعاً' })
  @IsNotEmpty({ message: 'اسم التخصص الطبي مطلوب' })
  @MaxLength(100, { message: 'اسم التخصص لا يجب أن يتجاوز 100 حرف' })
  name: string;

  @ApiPropertyOptional({
    description: 'A brief description of what this specialization covers (optional)',
    example: 'Focuses on disorders of the heart and the cardiovascular system.',
    maxLength: 300,
  })
  @IsString({ message: 'وصف التخصص يجب أن يكون نصاً' })
  @IsOptional()
  @MaxLength(300, { message: 'وصف التخصص لا يجب أن يتجاوز 300 حرف' })
  description?: string;
  @ApiPropertyOptional({ example: 'https://example.com/dental.png' })
  @IsString()
  @IsOptional()
  icon?: string;

}