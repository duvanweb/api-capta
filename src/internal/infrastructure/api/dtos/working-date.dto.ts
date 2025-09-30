import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, IsString, Matches, Max } from 'class-validator';

export class WorkingDateDto {
  @ApiPropertyOptional({
    description: 'Cantidad de días a sumar',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(3650, { message: 'No se pueden sumar más de 3650 días' })
  days?: number;

  @ApiPropertyOptional({
    description: 'Cantidad de horas a sumar',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(87600, { message: 'No se pueden sumar más de 87600 horas' })
  hours?: number;

  @ApiPropertyOptional({
    description: 'Fecha base en formato ISO 8601: YYYY-MM-DDTHH:mm:ss.SSS[Z]',
    example: '2023-12-25T10:30:00.123Z'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z?$/, {
    message: 'La fecha debe estar en formato YYYY-MM-DDTHH:mm:ss.SSS[Z]'
  })
  date?: string;
}
