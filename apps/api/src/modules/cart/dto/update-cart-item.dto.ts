import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartItemDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(99)
  quantity!: number;
}
