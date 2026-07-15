import { type NotificationDto, NotificationType } from '@coresphere/shared';
import type { Types } from 'mongoose';
import { ApiError } from '../../utils/ApiError';
import { userRepository } from '../users/user.repository';
import { notificationRepository } from './notification.repository';
import { toNotificationDto, type NotificationAttrs } from './notification.model';
import type { BroadcastInput, ListNotificationsQuery } from './notification.schemas';

export const notificationService = {
  async list(userId: string, query: ListNotificationsQuery): Promise<{ items: NotificationDto[]; total: number }> {
    const { items, total } = await notificationRepository.findPaginated(userId, query);
    return { items: items.map(toNotificationDto), total };
  },

  unreadCount(userId: string): Promise<number> {
    return notificationRepository.unreadCount(userId);
  },

  async markRead(userId: string, id: string): Promise<void> {
    const ok = await notificationRepository.markRead(id, userId);
    if (!ok) throw ApiError.notFound('Notification not found');
  },

  async markAllRead(userId: string): Promise<void> {
    await notificationRepository.markAllRead(userId);
  },

  async remove(userId: string, id: string): Promise<void> {
    const ok = await notificationRepository.deleteById(id, userId);
    if (!ok) throw ApiError.notFound('Notification not found');
  },

  /** Creates a notification for every user (announcement). Returns the count. */
  async broadcast(input: BroadcastInput): Promise<{ recipients: number }> {
    const userIds = await userRepository.findAllIds();
    const docs: NotificationAttrs[] = userIds.map((id) => ({
      user: id as unknown as Types.ObjectId,
      title: input.title,
      message: input.message,
      type: input.type ?? NotificationType.Info,
      read: false,
    }));
    if (docs.length > 0) await notificationRepository.insertMany(docs);
    return { recipients: docs.length };
  },
};
