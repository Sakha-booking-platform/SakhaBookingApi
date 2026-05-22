import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecializationDto {
  @ApiProperty({ description: 'Name of the medical specialization', example: 'Cardiology' })
  @IsString({ message: 'Specialization name must be a string' })
  @IsNotEmpty({ message: 'Medical specialization name is required' })
  @MaxLength(100, { message: 'Specialization name must not exceed 100 characters' })
  name: string; 
  
  @ApiPropertyOptional({ description: 'Description of the medical specialization', example: 'Heart and blood vessels' })
  @IsString({ message: 'Specialization description must be a string' })
  @IsOptional()
  @MaxLength(300, { message: 'Specialization description must not exceed 300 characters' })
  description?: string;
}