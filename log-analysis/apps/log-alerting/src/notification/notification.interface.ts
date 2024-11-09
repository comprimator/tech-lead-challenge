export type ChannelType = 'email' | 'slack' | 'webhook';

export type NotificationChannel = {
  type: ChannelType;
  config?: Record<string, any>;
};
