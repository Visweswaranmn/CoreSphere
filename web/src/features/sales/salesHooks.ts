import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { salesApi, type DealListParams, type DealPayload } from './salesApi';

export const salesKeys = {
  all: ['sales'] as const,
  list: (p: DealListParams) => ['sales', 'list', p] as const,
  stats: () => ['sales', 'stats'] as const,
};

export function useDeals(params: DealListParams) {
  return useQuery({
    queryKey: salesKeys.list(params),
    queryFn: () => salesApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useDealStats() {
  return useQuery({ queryKey: salesKeys.stats(), queryFn: () => salesApi.stats() });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: salesKeys.all });
}

export function useCreateDeal() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: DealPayload) => salesApi.create(p), onSuccess: invalidate });
}

export function useUpdateDeal(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: Partial<DealPayload>) => salesApi.update(id, p), onSuccess: invalidate });
}

export function useChangeDealStage() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => salesApi.changeStage(id, stage),
    onSuccess: invalidate,
  });
}

export function useDeleteDeal() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => salesApi.remove(id), onSuccess: invalidate });
}
