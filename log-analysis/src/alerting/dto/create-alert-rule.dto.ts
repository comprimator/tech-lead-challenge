import {
  IsString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ChannelType } from '../../notification/notification.interface';

class ConditionDto {
  @IsString()
  field: string;

  @IsString()
  operator: string;

  @IsString()
  value: string;
}

class NotificationChannelDto {
  @IsString()
  type: ChannelType;

  @IsOptional()
  config: any;
}

export class CreateAlertRuleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  enabled: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions: ConditionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationChannelDto)
  notificationChannels: NotificationChannelDto[];
}
