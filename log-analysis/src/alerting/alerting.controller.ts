import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { UpdateAlertRuleDto } from './dto/update-alert-rule.dto';
import { AlertingService } from './alerting.service';
import { AlertRule } from './alerting.interface';

@Controller('alerts')
export class AlertingController {
  constructor(private readonly alertingService: AlertingService) {}

  @Get()
  async getAll(): Promise<AlertRule[]> {
    return await this.alertingService.findAll();
  }

  @Post()
  async create(
    @Body() createAlertRuleDto: CreateAlertRuleDto,
  ): Promise<AlertRule> {
    const alertRule: AlertRule = {
      ...createAlertRuleDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await this.alertingService.create(alertRule);
    return { ...alertRule, _id: result.insertedId };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAlertRuleDto: UpdateAlertRuleDto,
  ): Promise<void> {
    const alertRule = {
      ...updateAlertRuleDto,
      updatedAt: new Date(),
    } as AlertRule;

    await this.alertingService.update(id, alertRule);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.alertingService.delete(id);
  }
}
