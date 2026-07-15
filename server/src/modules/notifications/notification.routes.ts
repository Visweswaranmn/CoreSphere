import { Router } from 'express';
import { z } from 'zod';
import { Role } from '@coresphere/shared';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { objectId } from '../employees/employee.schemas';
import { broadcastSchema, listNotificationsQuerySchema } from './notification.schemas';
import {
  broadcast,
  deleteNotification,
  getUnreadCount,
  listNotifications,
  markAllRead,
  markRead,
} from './notification.controller';

export const notificationRouter: Router = Router();

const idParams = z.object({ id: objectId });

notificationRouter.use(authenticate);

notificationRouter.get('/', validate({ query: listNotificationsQuerySchema }), listNotifications);
notificationRouter.get('/unread-count', getUnreadCount);
notificationRouter.post('/read-all', markAllRead);
notificationRouter.post('/broadcast', authorize(Role.SuperAdmin), validate({ body: broadcastSchema }), broadcast);
notificationRouter.post('/:id/read', validate({ params: idParams }), markRead);
notificationRouter.delete('/:id', validate({ params: idParams }), deleteNotification);
