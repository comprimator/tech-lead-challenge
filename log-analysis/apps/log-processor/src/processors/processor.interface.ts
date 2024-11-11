export interface RawLogEntry {
  [key: string]: any;
  message?: string;
  timestamp?: string;
  level?: string;
}

export interface ProcessedLogEntry extends RawLogEntry {
  source: string;
  timestamp: string;
  // TODO: add handling log level standardization
  standardizedLevel?: string;
  // TODO: Add additional fields
}
