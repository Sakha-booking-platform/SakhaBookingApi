import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ListClinicsQueryDto {
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

  @ApiPropertyOptional({ example: 13.5795 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: 44.0209 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  lng?: number;
}
