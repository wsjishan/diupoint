import { Transform } from 'class-transformer';
import { IsEmail, Matches } from 'class-validator';

export class ConfirmVerificationDto {
  @Transform(({ value }) => String(value).trim().toLowerCase())
  @IsEmail()
  verificationEmail!: string;

  @Transform(({ value }) => String(value).trim())
  @Matches(/^\d{6}$/, { message: 'otp must be a 6-digit numeric code' })
  otp!: string;
}
