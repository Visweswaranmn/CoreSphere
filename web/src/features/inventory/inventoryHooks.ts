import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  inventoryApi,
  type AssetListParams,
  type AssetPayload,
  type ItemListParams,
  type ItemPayload,
  type MovementPayload,
} from './inventoryApi';

export const inventoryKeys = {
  all: ['inventory'] as const,
  items: (p: ItemListParams) => ['inventory', 'items', p] as const,
  item: (id: string) => ['inventory', 'item', id] as const,
  itemStats: () => ['inventory', 'itemStats'] as const,
  movements: (id: string) => ['inventory', 'movements', id] as const,
  assets: (p: AssetListParams) => ['inventory', 'assets', p] as const,
  assetStats: () => ['inventory', 'assetStats'] as const,
};

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
}

// ─── Items ───────────────────────────────────────────────────────────────────
export function useItems(params: ItemListParams) {
  return useQuery({
    queryKey: inventoryKeys.items(params),
    queryFn: () => inventoryApi.listItems(params),
    placeholderData: (previous) => previous,
  });
}
export function useItem(id: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.item(id ?? ''),
    queryFn: () => inventoryApi.getItem(id as string),
    enabled: Boolean(id),
  });
}
export function useItemStats() {
  return useQuery({ queryKey: inventoryKeys.itemStats(), queryFn: () => inventoryApi.itemStats() });
}
export function useMovements(id: string | undefined) {
  return useQuery({
    queryKey: inventoryKeys.movements(id ?? ''),
    queryFn: () => inventoryApi.listMovements(id as string),
    enabled: Boolean(id),
  });
}
export function useCreateItem() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: ItemPayload) => inventoryApi.createItem(p), onSuccess: invalidate });
}
export function useUpdateItem(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: Partial<ItemPayload>) => inventoryApi.updateItem(id, p), onSuccess: invalidate });
}
export function useDeleteItem() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => inventoryApi.deleteItem(id), onSuccess: invalidate });
}
export function useRecordMovement(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: MovementPayload) => inventoryApi.recordMovement(id, p), onSuccess: invalidate });
}

// ─── Assets ──────────────────────────────────────────────────────────────────
export function useAssets(params: AssetListParams) {
  return useQuery({
    queryKey: inventoryKeys.assets(params),
    queryFn: () => inventoryApi.listAssets(params),
    placeholderData: (previous) => previous,
  });
}
export function useAssetStats() {
  return useQuery({ queryKey: inventoryKeys.assetStats(), queryFn: () => inventoryApi.assetStats() });
}
export function useCreateAsset() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: AssetPayload) => inventoryApi.createAsset(p), onSuccess: invalidate });
}
export function useUpdateAsset(id: string) {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: Partial<AssetPayload>) => inventoryApi.updateAsset(id, p), onSuccess: invalidate });
}
export function useAssignAsset() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, employeeId }: { id: string; employeeId: string }) => inventoryApi.assignAsset(id, employeeId),
    onSuccess: invalidate,
  });
}
export function useAssetAction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (args: { action: 'return'; id: string } | { action: 'status'; id: string; status: string }) =>
      args.action === 'return'
        ? inventoryApi.returnAsset(args.id)
        : inventoryApi.changeAssetStatus(args.id, args.status),
    onSuccess: invalidate,
  });
}
export function useDeleteAsset() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => inventoryApi.deleteAsset(id), onSuccess: invalidate });
}
