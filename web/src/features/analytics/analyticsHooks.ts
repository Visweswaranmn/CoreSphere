import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from './analyticsApi';

export function useOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.overview(),
    staleTime: 60_000,
  });
}
