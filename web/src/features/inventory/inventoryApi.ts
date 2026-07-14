import type {
  AssetDto,
  AssetStats,
  InventoryItemDto,
  InventoryStats,
  Paginated,
  StockMovementDto,
} from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface ItemListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  warehouse?: string;
  lowStock?: string;
}
export interface ItemPayload {
  name: string;
  category: string;
  unit: string;
  quantity?: number;
  reorderLevel: number;
  unitCost: number;
  warehouse: string;
}
export interface MovementPayload {
  type: string;
  quantity: number;
  reason?: string;
  reference?: string;
}
export interface AssetListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
}
export interface AssetPayload {
  name: string;
  category: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  location?: string;
  notes?: string;
}

export const inventoryApi = {
  // Items
  listItems(params: ItemListParams): Promise<Paginated<InventoryItemDto>> {
    return apiClient.get<Paginated<InventoryItemDto>>(`/inventory/items${toQueryString({ ...params })}`);
  },
  itemStats(): Promise<InventoryStats> {
    return apiClient.get<InventoryStats>('/inventory/items/stats');
  },
  getItem(id: string): Promise<InventoryItemDto> {
    return apiClient.get<InventoryItemDto>(`/inventory/items/${id}`);
  },
  createItem(payload: ItemPayload): Promise<InventoryItemDto> {
    return apiClient.post<InventoryItemDto>('/inventory/items', payload);
  },
  updateItem(id: string, payload: Partial<ItemPayload>): Promise<InventoryItemDto> {
    return apiClient.patch<InventoryItemDto>(`/inventory/items/${id}`, payload);
  },
  deleteItem(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/inventory/items/${id}`);
  },
  listMovements(id: string): Promise<StockMovementDto[]> {
    return apiClient.get<StockMovementDto[]>(`/inventory/items/${id}/movements`);
  },
  recordMovement(id: string, payload: MovementPayload): Promise<InventoryItemDto> {
    return apiClient.post<InventoryItemDto>(`/inventory/items/${id}/movements`, payload);
  },

  // Assets
  listAssets(params: AssetListParams): Promise<Paginated<AssetDto>> {
    return apiClient.get<Paginated<AssetDto>>(`/inventory/assets${toQueryString({ ...params })}`);
  },
  assetStats(): Promise<AssetStats> {
    return apiClient.get<AssetStats>('/inventory/assets/stats');
  },
  createAsset(payload: AssetPayload): Promise<AssetDto> {
    return apiClient.post<AssetDto>('/inventory/assets', payload);
  },
  updateAsset(id: string, payload: Partial<AssetPayload>): Promise<AssetDto> {
    return apiClient.patch<AssetDto>(`/inventory/assets/${id}`, payload);
  },
  assignAsset(id: string, employeeId: string): Promise<AssetDto> {
    return apiClient.post<AssetDto>(`/inventory/assets/${id}/assign`, { employeeId });
  },
  returnAsset(id: string): Promise<AssetDto> {
    return apiClient.post<AssetDto>(`/inventory/assets/${id}/return`);
  },
  changeAssetStatus(id: string, status: string): Promise<AssetDto> {
    return apiClient.patch<AssetDto>(`/inventory/assets/${id}/status`, { status });
  },
  deleteAsset(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/inventory/assets/${id}`);
  },
};
