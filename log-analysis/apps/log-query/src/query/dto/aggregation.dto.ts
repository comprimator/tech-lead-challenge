import { IsOptional, IsISO8601, IsString, IsIn } from 'class-validator';

export class AggregationDto {
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

  @IsString()
  readonly aggregationField: string;

  @IsString()
  @IsIn(['terms', 'date_histogram'])
  readonly aggregationType: string;

  @IsOptional()
  @IsString()
  @IsIn(['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'])
  readonly interval?: string;
}
