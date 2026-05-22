import { IsNotEmpty, IsString, IsOptional, IsPhoneNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClinicDto {
  @ApiProperty({ description: 'Name of the clinic', example: 'Al-Noor Clinic' })
  @IsString({ message: 'Clinic name must be a string' })
  @IsNotEmpty({ message: 'Clinic name is required and cannot be empty' })
  @MaxLength(100, { message: 'Clinic name must not exceed 100 characters' })
  name: string;

  @ApiProperty({ description: 'Address of the clinic', example: '60th Street, Next to City Mall' })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'Clinic address is required to locate it for patients' })
  @MaxLength(255, { message: 'Address is too long, please abbreviate' })
  address: string;

  @ApiProperty({ description: 'City/Governorate of the clinic', example: 'Sanaa' })
  @IsString({ message: 'City/Governorate must be a string' })
  @IsNotEmpty({ message: 'Please specify the city or governorate to facilitate filtering and search' })
  @MaxLength(50, { message: 'City name must not exceed 50 characters' })
  city: string; // مثل: صنعاء، عدن، حضرموت...

  @ApiProperty({ description: 'Phone number of the clinic', example: '+967770000000' })
  @IsPhoneNumber('YE', { message: 'Please enter a valid and correct clinic phone number' })
  @IsNotEmpty({ message: 'Clinic phone number is required for communication' })
  phone: string;

  @ApiPropertyOptional({ description: 'Description of the clinic', example: 'Specialized in eye care' })
  @IsString({ message: 'Description must be a string' })
  @IsOptional() // حقل اختياري
  @MaxLength(500, { message: 'Clinic introductory description must not exceed 500 characters' })
  description?: string;
}