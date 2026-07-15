export const NotificationType = {
  Info: 'info',
  Success: 'success',
  Warning: 'warning',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
export const NOTIFICATION_TYPES: readonly NotificationType[] = Object.values(NotificationType);

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface UnreadCount {
  unread: number;
}
