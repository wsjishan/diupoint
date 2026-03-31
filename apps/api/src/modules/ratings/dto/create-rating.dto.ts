import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRatingDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(5)
  value!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
