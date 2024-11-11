export type AlertConditionOperator =
  | 'equals'
  | 'contains'
  | 'greaterThan'
  | 'lessThan'
  | 'matches';

export interface AlertCondition {
  field: string;
  operator: AlertConditionOperator;
  value: string;
}

export interface AlertRule {
  _id?: any;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: AlertCondition[];
  notificationChannels: {
    type: string;
    config?: any;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
