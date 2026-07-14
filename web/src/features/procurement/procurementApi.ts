import type {
  Paginated,
  PurchaseOrderDto,
  PurchaseOrderStats,
  VendorDto,
  VendorStats,
} from '@coresphere/shared';
import { apiClient } from '@/lib/apiClient';
import { toQueryString } from '@/lib/queryString';

export interface VendorListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface VendorPayload {
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  taxId?: string;
  website?: string;
  notes?: string;
}

export interface OrderItemInput {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderPayload {
  vendorId: string;
  title: string;
  description?: string;
  items: OrderItemInput[];
  taxRate: number;
  expectedDate?: string;
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  vendorId?: string;
}

export const procurementApi = {
  // Vendors
  listVendors(params: VendorListParams): Promise<Paginated<VendorDto>> {
    return apiClient.get<Paginated<VendorDto>>(`/procurement/vendors${toQueryString({ ...params })}`);
  },
  vendorStats(): Promise<VendorStats> {
    return apiClient.get<VendorStats>('/procurement/vendors/stats');
  },
  createVendor(payload: VendorPayload): Promise<VendorDto> {
    return apiClient.post<VendorDto>('/procurement/vendors', payload);
  },
  updateVendor(id: string, payload: Partial<VendorPayload>): Promise<VendorDto> {
    return apiClient.patch<VendorDto>(`/procurement/vendors/${id}`, payload);
  },
  changeVendorStatus(id: string, status: string): Promise<VendorDto> {
    return apiClient.patch<VendorDto>(`/procurement/vendors/${id}/status`, { status });
  },
  deleteVendor(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/procurement/vendors/${id}`);
  },

  // Purchase orders
  listOrders(params: OrderListParams): Promise<Paginated<PurchaseOrderDto>> {
    return apiClient.get<Paginated<PurchaseOrderDto>>(`/procurement/orders${toQueryString({ ...params })}`);
  },
  orderStats(): Promise<PurchaseOrderStats> {
    return apiClient.get<PurchaseOrderStats>('/procurement/orders/stats');
  },
  getOrder(id: string): Promise<PurchaseOrderDto> {
    return apiClient.get<PurchaseOrderDto>(`/procurement/orders/${id}`);
  },
  createOrder(payload: OrderPayload): Promise<PurchaseOrderDto> {
    return apiClient.post<PurchaseOrderDto>('/procurement/orders', payload);
  },
  submitOrder(id: string): Promise<PurchaseOrderDto> {
    return apiClient.post<PurchaseOrderDto>(`/procurement/orders/${id}/submit`);
  },
  decideOrder(id: string, status: 'approved' | 'rejected', note?: string): Promise<PurchaseOrderDto> {
    return apiClient.post<PurchaseOrderDto>(`/procurement/orders/${id}/decision`, { status, note });
  },
  receiveOrder(id: string): Promise<PurchaseOrderDto> {
    return apiClient.post<PurchaseOrderDto>(`/procurement/orders/${id}/receive`);
  },
  cancelOrder(id: string): Promise<PurchaseOrderDto> {
    return apiClient.post<PurchaseOrderDto>(`/procurement/orders/${id}/cancel`);
  },
  deleteOrder(id: string): Promise<{ id: string }> {
    return apiClient.delete<{ id: string }>(`/procurement/orders/${id}`);
  },
};
