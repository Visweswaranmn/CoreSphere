import { type FilterQuery } from 'mongoose';
import {
  NotificationModel,
  type NotificationAttrs,
  type NotificationDoc,
  type NotificationHydrated,
} from './notification.model';
import type { ListNotificationsQuery } from './notification.schemas';

export const notificationRepository = {
  async findPaginated(
    userId: string,
    query: ListNotificationsQuery,
  ): Promise<{ items: NotificationHydrated[]; total: number }> {
    const filter: FilterQuery<NotificationDoc> = { user: userId };
    if (query.unread === 'true') filter.read = false;

    const [items, total] = await Promise.all([
      NotificationModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      NotificationModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  unreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ user: userId, read: false }).exec();
  },

  async markRead(id: string, userId: string): Promise<boolean> {
    const res = await NotificationModel.updateOne({ _id: id, user: userId }, { $set: { read: true } }).exec();
    return res.matchedCount > 0;
  },

  markAllRead(userId: string): Promise<unknown> {
    return NotificationModel.updateMany({ user: userId, read: false }, { $set: { read: true } }).exec();
  },

  async deleteById(id: string, userId: string): Promise<boolean> {
    const res = await NotificationModel.findOneAndDelete({ _id: id, user: userId }).exec();
    return res !== null;
  },

  insertMany(docs: NotificationAttrs[]): Promise<unknown> {
    return NotificationModel.insertMany(docs);
  },
};
