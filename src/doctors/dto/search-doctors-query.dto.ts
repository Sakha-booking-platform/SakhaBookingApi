import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDoctorsQueryDto {
  @ApiPropertyOptional({ example: 'احمد اسنان' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  specializationId?: number;

  @ApiPropertyOptional({ enum: ['rating'], example: 'rating' })
  @IsIn(['rating'])
  @IsOptional()
  sortBy?: 'rating';

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({ example: 10, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit = 10;
}
