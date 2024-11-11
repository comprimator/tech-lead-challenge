import { EventEmitter } from 'events';

export interface IIngestor extends EventEmitter {
  initialize(): Promise<void>;

  start(): Promise<void>;

  stop(): Promise<void>;
}

export interface IngestorConfig {
  _id?: any;
  name: string;
  type: string;
  module: string;
  enabled: boolean;
  options?: any;
  updatedAt: Date;
}
