import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type BroadcastPayload, type NotificationListParams } from './notificationsApi';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (p: NotificationListParams) => ['notifications', 'list', p] as const,
  unread: () => ['notifications', 'unread'] as const,
};

export function useNotifications(params: NotificationListParams) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationsApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: notificationKeys.all });
}

export function useMarkRead() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => notificationsApi.markRead(id), onSuccess: invalidate });
}

export function useMarkAllRead() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: () => notificationsApi.markAllRead(), onSuccess: invalidate });
}

export function useDeleteNotification() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => notificationsApi.remove(id), onSuccess: invalidate });
}

export function useBroadcast() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: BroadcastPayload) => notificationsApi.broadcast(p), onSuccess: invalidate });
}
