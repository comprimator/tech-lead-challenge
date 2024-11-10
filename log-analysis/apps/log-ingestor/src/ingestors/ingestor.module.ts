import { Module } from '@nestjs/common';
import { IngestorService } from './ingestor.service';
import { IngestorController } from './ingestor.controller';
import { DatabaseModule } from '@shared/shared-lib/db/db.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot(),
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'PROCESSOR_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host:
              configService.get('PROCESSOR_SERVICE_TCP_HOST') ?? 'localhost',
            port: configService.get('PROCESSOR_SERVICE_TCP_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [IngestorService, IngestorController],
  exports: [IngestorController, IngestorService],
})
export class IngestorModule {}
