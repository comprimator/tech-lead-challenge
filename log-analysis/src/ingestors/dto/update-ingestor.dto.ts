import { PartialType } from '@nestjs/mapped-types';
import { CreateIngestorDto } from './create-ingestor.dto';
import { IsOptional, IsString, IsBoolean, IsObject } from 'class-validator';

export class UpdateIngestorDto extends PartialType(CreateIngestorDto) {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly type?: string;

  @IsOptional()
  @IsString()
  readonly module?: string;

  @IsOptional()
  @IsBoolean()
  readonly enabled?: boolean;

  @IsOptional()
  @IsObject()
  readonly options?: any;
}
