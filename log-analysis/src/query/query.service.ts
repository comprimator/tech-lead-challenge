import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AggregationDto } from './dto/aggregation.dto';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { QueryDto } from './dto/query.dto';
import { INDEX_PREFIX } from '../db/db.const';

@Injectable()
export class QueryService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject('ELASTIC_CONNECTION')
    private readonly esClient: ElasticsearchService,
  ) {}

  async aggregateLogs(aggregationParams: AggregationDto): Promise<any> {
    const {
      startTime,
      endTime,
      source,
      logLevel,
      aggregationField,
      aggregationType,
      interval,
    } = aggregationParams;

    const filters = [];

    if (startTime || endTime) {
      filters.push({
        range: {
          timestamp: {
            ...(startTime ? { gte: startTime } : {}),
            ...(endTime ? { lte: endTime } : {}),
            format: 'strict_date_optional_time',
          },
        },
      });
    }

    if (source) {
      filters.push({
        term: {
          source,
        },
      });
    }

    if (logLevel) {
      filters.push({
        term: {
          logLevel: logLevel.toUpperCase(),
        },
      });
    }

    const query = {
      bool: {
        filter: filters,
      },
    };

    const aggs = this.buildAggregation(
      aggregationType,
      aggregationField,
      interval,
    );

    try {
      const result = await this.esClient.search({
        index: `${INDEX_PREFIX}-*`,
        query: query,
        aggs: aggs,
        size: 0,
      });

      return result?.aggregations?.aggregation;
    } catch (error) {
      this.logger.error('Elasticsearch aggregation failed:', error);
      throw new InternalServerErrorException('Failed to perform aggregation');
    }
  }

  private buildAggregation(
    aggregationType: string,
    aggregationField: string,
    interval?: string,
  ) {
    const aggs: any = {};

    switch (aggregationType) {
      case 'terms':
        aggs['aggregation'] = {
          terms: {
            field: aggregationField,
          },
        };
        break;
      case 'date_histogram':
        aggs['aggregation'] = {
          date_histogram: {
            field: aggregationField,
            calendar_interval: interval || 'day',
          },
        };
        break;
      // TODO: Add more aggregation types as needed
      default:
        throw new Error(`Unsupported aggregation type: ${aggregationType}`);
    }

    return aggs;
  }

  async searchLogs(queryParams: QueryDto): Promise<any> {
    const {
      startTime,
      endTime,
      source,
      logLevel,
      message,
      pattern,
      page = 1,
      size = 10,
    } = queryParams;

    const mustQueries = [];

    if (startTime || endTime) {
      mustQueries.push({
        range: {
          timestamp: {
            ...(startTime ? { gte: startTime } : {}),
            ...(endTime ? { lte: endTime } : {}),
            format: 'strict_date_optional_time',
          },
        },
      });
    }

    if (source) {
      mustQueries.push({
        term: {
          source: source,
        },
      });
    }

    if (logLevel) {
      mustQueries.push({
        term: {
          logLevel: logLevel.toUpperCase(),
        },
      });
    }

    if (message) {
      mustQueries.push({
        match: {
          message: message,
        },
      });
    }

    if (pattern) {
      mustQueries.push({
        regexp: {
          message: {
            value: pattern,
            flags: 'ALL',
            case_insensitive: true,
          },
        },
      });
    }

    const query = {
      bool: {
        must: mustQueries,
      },
    };

    const from = (page - 1) * size;

    try {
      const result = await this.esClient.search({
        index: `${INDEX_PREFIX}-*`,
        query,
        sort: [
          {
            timestamp: {
              order: 'desc',
            },
          },
        ],
        from: from,
        size: size,
      });

      return {
        total: result.hits.total,
        hits: result.hits.hits.map((hit) => hit._source),
      };
    } catch (error) {
      this.logger.error('Elasticsearch query failed:', error);
      throw new InternalServerErrorException('Failed to fetch logs');
    }
  }
}
