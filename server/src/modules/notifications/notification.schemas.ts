import { z } from 'zod';
import { NotificationType } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';

export const broadcastSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(160),
  message: z.string().trim().min(1, 'Message is required').max(500),
  type: z.nativeEnum(NotificationType).default(NotificationType.Info),
});

export const listNotificationsQuerySchema = paginationQuerySchema.extend({
  unread: z.enum(['true', 'false']).optional(),
});

export type BroadcastInput = z.infer<typeof broadcastSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
