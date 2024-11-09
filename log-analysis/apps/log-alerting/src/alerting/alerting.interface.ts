export interface AlertRule {
  _id?: any;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
  notificationChannels: {
    type: string;
    config?: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
