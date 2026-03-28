import { ListingCondition } from '../../../common/legacy-prisma-enums';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export enum ListingSort {
  LATEST = 'latest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

export class ListListingsQueryDto {
  @IsOptional()
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MaxLength(160)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsEnum(ListingCondition)
  condition?: ListingCondition;

  @IsOptional()
  @IsEnum(ListingSort)
  sort: ListingSort = ListingSort.LATEST;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
