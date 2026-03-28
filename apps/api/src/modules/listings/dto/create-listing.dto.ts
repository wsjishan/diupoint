import {
  ListingCondition,
  ListingStatus,
  SellerType,
} from '../../../common/legacy-prisma-enums';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateListingDto {
  @IsEnum(SellerType)
  sellerType!: SellerType;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  storeProfileId?: string;

  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  category!: string;

  @IsEnum(ListingCondition)
  condition!: ListingCondition;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  price!: number;

  @Transform(({ value }) => String(value).trim())
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  location!: string;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
