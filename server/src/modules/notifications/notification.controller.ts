import type { Request, Response } from 'express';
import type { UnreadCount } from '@coresphere/shared';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/respond';
import { buildPaginated } from '../../utils/pagination';
import { ApiError } from '../../utils/ApiError';
import { notificationService } from './notification.service';
import type { BroadcastInput, ListNotificationsQuery } from './notification.schemas';

function userId(req: Request): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.id;
}

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ListNotificationsQuery;
  const { items, total } = await notificationService.list(userId(req), query);
  return sendSuccess(res, buildPaginated(items, total, query.page, query.pageSize));
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const unread = await notificationService.unreadCount(userId(req));
  return sendSuccess<UnreadCount>(res, { unread });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markRead(userId(req), req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Marked as read');
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllRead(userId(req));
  return sendSuccess(res, { ok: true }, 200, 'All marked as read');
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.remove(userId(req), req.params.id as string);
  return sendSuccess(res, { id: req.params.id }, 200, 'Notification removed');
});

export const broadcast = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.broadcast(req.body as BroadcastInput);
  return sendSuccess(res, result, 201, 'Announcement sent');
});
