import { EventEmitter } from 'events';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DockerRode = require('dockerode');
import { Container } from 'dockerode';
import { IIngestor } from '../ingestor.interface';
import { Logger } from '@nestjs/common';

export class DockerIngestor extends EventEmitter implements IIngestor {
  private readonly docker;
  private containers: {
    logStream?: NodeJS.ReadableStream;
    container: Container;
  }[] = [];
  private readonly containerIds: string[];
  private readonly logger = new Logger(this.constructor.name);

  constructor(options: { containerIds: string[] }) {
    super();
    this.containerIds = options.containerIds;
    this.docker = new DockerRode();
  }

  async initialize(): Promise<void> {
    for (const id of this.containerIds) {
      try {
        const container = this.docker.getContainer(id);
        await container.inspect();
      } catch (error: any) {
        this.logger.error(`Container not found or inaccessible: ${id}`, error);
        throw new Error(`Container not found or inaccessible: ${id}`);
      }
    }
  }

  async start(): Promise<void> {
    for (const id of this.containerIds) {
      const container: Container = this.docker.getContainer(id);
      const logStream = await this.attachLogStream(container);
      this.containers.push({ container, logStream });
    }
  }

  async stop(): Promise<void> {
    for (const container of this.containers) {
      container.logStream?.unpipe();
      container.logStream?.removeAllListeners();
    }
    this.containers = [];
  }

  private async attachLogStream(container: Container) {
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      tail: 0,
    });

    stream.on('data', (chunk) => {
      const log = chunk.toString('utf8').trim();
      if (log) {
        this.emit('log', log);
        this.logger.verbose(
          `Received log from container ${container.id}: ${log}`,
        );
      }
    });

    stream.on('error', (error) => {
      this.logger.error(
        `Error reading logs from container ${container.id}:`,
        error,
      );
    });

    stream.on('end', () => {
      this.logger.debug(`Log stream ended for container ${container.id}`);
    });

    return stream;
  }
}
