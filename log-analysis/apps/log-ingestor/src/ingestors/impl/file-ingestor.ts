import { EventEmitter } from 'events';
import * as fs from 'fs';
import { IIngestor } from '../ingestor.interface';
import { Logger } from '@nestjs/common';

export class FileIngestor extends EventEmitter implements IIngestor {
  private fileWatchers: fs.FSWatcher[] = [];
  private readonly filePaths: string[];
  private readonly logger = new Logger(this.constructor.name);

  constructor(options: { filePaths: string[] }) {
    super();
    this.filePaths = options.filePaths;
  }

  async initialize(): Promise<void> {
    for (const filePath of this.filePaths) {
      if (!fs.existsSync(filePath)) {
        // TODO: Handle this error more gracefully
        throw new Error(`File not found: ${filePath}`);
      }
    }
  }

  async start(): Promise<void> {
    for (const filePath of this.filePaths) {
      await this.monitorFile(filePath);
    }
  }

  async stop(): Promise<void> {
    for (const watcher of this.fileWatchers) {
      watcher.close();
    }
    this.fileWatchers = [];
  }

  private async monitorFile(filePath: string): Promise<void> {
    let filePosition = fs.statSync(filePath).size;

    const readStreamOptions = {
      encoding: 'utf8' as BufferEncoding,
      start: filePosition,
    };

    const readNewData = () => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          // TODO: Handle this error more gracefully
          this.logger.error(`Error stating file ${filePath}:`, err);
          return;
        }

        if (stats.size < filePosition) {
          filePosition = 0;
        }

        if (stats.size > filePosition) {
          const stream = fs.createReadStream(filePath, {
            ...readStreamOptions,
            start: filePosition,
            end: stats.size,
          });

          let buffer = '';
          stream.on('data', (data) => {
            buffer += data;
          });

          stream.on('end', () => {
            if (buffer) {
              const lines = buffer.split('\n');
              lines.forEach((line) => {
                if (line.trim()) {
                  this.emit('log', line.trim());
                }
              });
            }
            filePosition = stats.size;
          });

          stream.on('error', (error) => {
            this.logger.error(`Error reading file ${filePath}:`, error);
          });
        }
      });
    };

    const watcher = this.createWatcher(filePath, readNewData);

    // TODO: Handle initial data. Need to decide if we want to read from the beginning or not.

    this.fileWatchers.push(watcher);
  }

  private createWatcher(filePath: string, readNewData: () => void) {
    const watcher = fs.watch(filePath, (eventType) => {
      if (eventType === 'change') {
        readNewData();
      } else if (eventType === 'rename') {
        watcher.close();
        setTimeout(() => {
          this.monitorFile(filePath).catch((err) => {
            // TODO: Handle this error more gracefully
            this.logger.error(`Error re-watching file ${filePath}:`, err);
          });
        }, 1000);
      }
    });
    return watcher;
  }
}
