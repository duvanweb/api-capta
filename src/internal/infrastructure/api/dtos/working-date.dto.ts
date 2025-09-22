import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class WorkingDateDto {
  @ApiPropertyOptional({
    description: 'Cantidad de días a sumar',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  days?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de horas a sumar',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  hours?: number;

  @ApiPropertyOptional({ description: 'Fecha base' })
  @IsOptional()
  @IsString()
  date?: string;
}
