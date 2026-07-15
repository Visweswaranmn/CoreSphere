import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import {
  type NotificationDto,
  type NotificationType as NotificationTypeValue,
  NOTIFICATION_TYPES,
  NotificationType,
} from '@coresphere/shared';

export interface NotificationAttrs {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationTypeValue;
  read: boolean;
}

export interface NotificationDoc extends NotificationAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationHydrated = HydratedDocument<NotificationDoc>;

const notificationSchema = new Schema<NotificationDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true, default: NotificationType.Info },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export function toNotificationDto(doc: NotificationHydrated): NotificationDto {
  return {
    id: doc.id as string,
    title: doc.title,
    message: doc.message,
    type: doc.type,
    read: doc.read,
    createdAt: doc.createdAt.toISOString(),
  };
}

export const NotificationModel: Model<NotificationDoc> = model<NotificationDoc>(
  'Notification',
  notificationSchema,
);
