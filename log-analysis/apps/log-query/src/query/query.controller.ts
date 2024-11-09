import { Controller, Get, Query } from '@nestjs/common';
import { QueryService } from './query.service';
import { AggregationDto } from './dto/aggregation.dto';
import { QueryDto } from './dto/query.dto';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) {}

  @Get('logs')
  async searchLogs(@Query() query: QueryDto): Promise<any> {
    return await this.queryService.searchLogs(query);
  }

  @Get('logs/aggregations')
  async aggregateLogs(@Query() query: AggregationDto): Promise<any> {
    return await this.queryService.aggregateLogs(query);
  }
}
