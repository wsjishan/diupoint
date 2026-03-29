import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class RequestVerificationDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  verificationEmail!: string;
}
