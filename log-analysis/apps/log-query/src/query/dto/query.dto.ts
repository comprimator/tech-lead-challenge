import {
  IsOptional,
  IsISO8601,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class QueryDto {
  @IsOptional()
  @IsISO8601()
  readonly startTime?: string;

  @IsOptional()
  @IsISO8601()
  readonly endTime?: string;

  @IsOptional()
  @IsString()
  readonly source?: string;

  @IsOptional()
  @IsString()
  readonly logLevel?: string;

  @IsOptional()
  @IsString()
  readonly message?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly size?: number = 10;

  @IsOptional()
  @IsString()
  readonly pattern?: string;
}
