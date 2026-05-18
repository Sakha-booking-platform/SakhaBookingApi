import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateSpecializationDto {
  @IsString({ message: 'اسم التخصص يجب أن يكون نصاً مراجعاً' })
  @IsNotEmpty({ message: 'اسم التخصص الطبي مطلوب' })
  @MaxLength(100, { message: 'اسم التخصص لا يجب أن يتجاوز 100 حرف' })
  name: string; 
  @IsString({ message: 'وصف التخصص يجب أن يكون نصاً' })
  @IsOptional()
  @MaxLength(300, { message: 'وصف التخصص لا يجب أن يتجاوز 300 حرف' })
  description?: string;
}