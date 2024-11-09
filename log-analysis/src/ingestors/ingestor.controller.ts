import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { CreateIngestorDto } from './dto/create-ingestor.dto';
import { UpdateIngestorDto } from './dto/update-ingestor.dto'; // Import the Update DTO
import { IngestorConfig } from './ingestor.interface';
import { IngestorService } from './ingestor.service';

@Controller('ingestors')
export class IngestorController {
  constructor(
    @Inject(IngestorService) private readonly ingestorService: IngestorService,
  ) {}

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
