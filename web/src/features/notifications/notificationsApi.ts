import type { NotificationDto, Paginated, UnreadCount } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface NotificationListParams {
  page?: number;
  pageSize?: number;
  unread?: string;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  type: string;
}

export const notificationsApi = {
  list(params: NotificationListParams): Promise<Paginated<NotificationDto>> {
    return apiClient.get<Paginated<NotificationDto>>(`/notifications${toQueryString({ ...params })}`);
  },
  unreadCount(): Promise<UnreadCount> {
    return apiClient.get<UnreadCount>('/notifications/unread-count');
  },
  markRead(id: string): Promise<{ id: string }> {
    return apiClient.post<{ id: string }>(`/notifications/${id}/read`);
  },
  markAllRead(): Promise<{ ok: boolean }> {
    return apiClient.post<{ ok: boolean }>('/notifications/read-all');
  },
  remove(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/notifications/${id}`);
  },
  broadcast(payload: BroadcastPayload): Promise<{ recipients: number }> {
    return apiClient.post<{ recipients: number }>('/notifications/broadcast', payload);
  },
};
