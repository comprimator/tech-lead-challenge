import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CreateIngestorDto } from './dto/create-ingestor.dto';
import { UpdateIngestorDto } from './dto/update-ingestor.dto';
import { IngestorConfig } from './ingestor.interface';
import { IngestorService } from './ingestor.service';

@Controller('ingestors')
export class IngestorController {
  constructor(
    @Inject(IngestorService) private readonly ingestorService: IngestorService,
  ) {}

  @Put('start')
  async startAll(): Promise<void> {
    await this.ingestorService.startAll();
  }

  @Put('stop')
  async stopAll(): Promise<void> {
    await this.ingestorService.stopAll();
  }

  @Put(':id/start')
  async start(@Param('id') id: string): Promise<void> {
    const ingestor = await this.ingestorService.getOne(id);
    if (!ingestor) {
      throw new HttpException(
        `Ingestor with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.ingestorService.startIngestor(ingestor);
  }

  @Put(':id/stop')
  async stop(@Param('id') id: string): Promise<void> {
    await this.ingestorService.stopIngester(id);
  }

  @Get()
  async findAll(): Promise<IngestorConfig[]> {
    return await this.ingestorService.getAll();
  }

  @Post()
  async create(
    @Body() createIngestorDto: CreateIngestorDto,
  ): Promise<IngestorConfig> {
    const ingestor: IngestorConfig = {
      ...createIngestorDto,
      updatedAt: new Date(),
    };
    return await this.ingestorService.createAndStart(ingestor);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIngestorDto: UpdateIngestorDto,
  ): Promise<void> {
    const ingestorConfig = {
      ...updateIngestorDto,
      updatedAt: new Date(),
    } as IngestorConfig;
    await this.ingestorService.updateAndRestart(id, ingestorConfig);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.ingestorService.deleteAndStop(id);
  }
}
