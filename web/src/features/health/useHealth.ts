import { useQuery } from '@tanstack/react-query';
import type { HealthStatus } from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';

/** Polls the API health endpoint to surface backend + database connectivity. */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.get<HealthStatus>('/health'),
    refetchInterval: 15_000,
  });
}
