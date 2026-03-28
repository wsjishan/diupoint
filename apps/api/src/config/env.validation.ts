import { Type, plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  DATABASE_URL?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  PROD_DATABASE_URL?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  GOOGLE_CALLBACK_URL?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  FRONTEND_URL?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  const effectiveDatabaseUrl =
    validatedConfig.DATABASE_URL ?? validatedConfig.PROD_DATABASE_URL;

  if (!effectiveDatabaseUrl) {
    throw new Error('DATABASE_URL or PROD_DATABASE_URL must be configured.');
  }

  validatedConfig.DATABASE_URL = effectiveDatabaseUrl;

  return validatedConfig;
}
