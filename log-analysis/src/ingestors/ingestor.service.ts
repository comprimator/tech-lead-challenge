import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  Logger,
} from '@nestjs/common';
import { MongoClient, Collection, ObjectId } from 'mongodb';
import * as path from 'path';
import { ModuleWhitelist } from './module-whitelist';
import { IIngestor, IngestorConfig } from './ingestor.interface';
import { ProcessorService } from '../processors/processor.service';

@Injectable()
export class IngestorService implements OnModuleInit, OnModuleDestroy {
  private ingestors: Map<string, IIngestor> = new Map();
  private ingestorCollection: Collection<IngestorConfig>;
  private logger = new Logger(this.constructor.name);

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly dbClient: MongoClient,
    @Inject(ProcessorService)
    private readonly processorService: ProcessorService,
  ) {}

  async onModuleInit() {
    const db = this.dbClient.db('log_analysis');
    this.ingestorCollection = db.collection<IngestorConfig>('ingestors');
    await this.startAll();
  }

  async onModuleDestroy() {
    await this.stopAll();
    await this.dbClient.close();
  }

  async getAll({ enabled = true }: { enabled?: boolean } = {}) {
    return await this.ingestorCollection.find({ enabled }).toArray();
  }

  async createAndStart(ingestor: IngestorConfig) {
    const result = await this.ingestorCollection.insertOne(ingestor);
    await this.addOrUpdateIngestor({ ...ingestor, _id: result.insertedId });
    return { ...ingestor, _id: result.insertedId };
  }

  async updateAndRestart(id: string, ingestorConfig: IngestorConfig) {
    await this.ingestorCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: ingestorConfig },
    );
    await this.addOrUpdateIngestor({
      ...ingestorConfig,
      _id: new ObjectId(id),
    });
  }

  async deleteAndStop(id: string) {
    await this.ingestorCollection.deleteOne({ _id: new ObjectId(id) });
    await this.stopIngester(new ObjectId(id));
  }

  private async startIngestor(config: IngestorConfig) {
    const modulePath = ModuleWhitelist[config.type];
    if (!modulePath) {
      this.logger.error(`Ingestor type ${config.type} is not allowed`);
      return;
    }

    const fullModulePath = path.join(__dirname, 'impl', modulePath);
    const { [config.type]: IngestorClass } = await import(fullModulePath);

    const ingestor: IIngestor = new IngestorClass(config.options || {});
    await ingestor.initialize();

    ingestor.on('log', (logData) => {
      this.logger.debug(`Received log from ${config.name}: ${logData}`);
      this.processorService.process(logData, config.name);
    });

    await ingestor.start();

    return ingestor;
  }

  private async addOrUpdateIngestor(config: IngestorConfig) {
    const ingestorKey = config._id.toString();
    const existingIngestor = this.ingestors.get(ingestorKey);

    if (existingIngestor) {
      await existingIngestor.stop();
      this.ingestors.delete(ingestorKey);
    }

    if (config.enabled) {
      const ingestor = await this.startIngestor(config);
      this.ingestors.set(ingestorKey, ingestor);
    }
  }

  private async stopIngester(ingestorId: any) {
    const ingestorKey = ingestorId.toString();
    const ingestor = this.ingestors.get(ingestorKey);
    if (ingestor) {
      await ingestor.stop();
      this.ingestors.delete(ingestorKey);
    }
  }

  private async startAll() {
    const configs = await this.getAll({ enabled: true });

    for (const config of configs) {
      await this.addOrUpdateIngestor(config);
    }
  }

  private async stopAll() {
    for (const ingestor of this.ingestors.values()) {
      await ingestor.stop();
    }
    this.ingestors.clear();
  }
}
