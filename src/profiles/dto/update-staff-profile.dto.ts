import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateStaffProfileDto {
  @ApiProperty({
    description: "The staff member's full name",
    example: 'Sara Al-Otaibi',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: "The staff member's job position or title",
    example: 'Receptionist',
  })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiPropertyOptional({
    description: 'The ID of the clinic this staff member is assigned to',
    example: 2,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  clinicId?: number;

  @ApiPropertyOptional({
    description: "The staff member's contact phone number",
    example: '+966507654321',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}