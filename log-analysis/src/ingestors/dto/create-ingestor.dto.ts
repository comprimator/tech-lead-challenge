import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class CreateIngestorDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly type: string;

  @IsString()
  readonly module: string;

  @IsBoolean()
  readonly enabled: boolean;

  @IsOptional()
  @IsObject()
  readonly options?: any;
}
