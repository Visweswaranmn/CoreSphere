import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi, type DocumentListParams } from './documentsApi';

export const documentKeys = {
  all: ['documents'] as const,
  list: (p: DocumentListParams) => ['documents', 'list', p] as const,
  stats: () => ['documents', 'stats'] as const,
};

export function useDocuments(params: DocumentListParams) {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentsApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useDocumentStats() {
  return useQuery({ queryKey: documentKeys.stats(), queryFn: () => documentsApi.stats() });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: documentKeys.all });
}

export function useUploadDocument() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (args: { file: File; name?: string; category: string; description?: string }) =>
      documentsApi.upload(args.file, args),
    onSuccess: invalidate,
  });
}

export function useDeleteDocument() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => documentsApi.remove(id), onSuccess: invalidate });
}
