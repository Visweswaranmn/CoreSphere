import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  procurementApi,
  type OrderListParams,
  type OrderPayload,
  type VendorListParams,
  type VendorPayload,
} from './procurementApi';

export const procurementKeys = {
  all: ['procurement'] as const,
  vendors: (params: VendorListParams) => ['procurement', 'vendors', params] as const,
  vendorStats: () => ['procurement', 'vendorStats'] as const,
  orders: (params: OrderListParams) => ['procurement', 'orders', params] as const,
  order: (id: string) => ['procurement', 'order', id] as const,
  orderStats: () => ['procurement', 'orderStats'] as const,
};

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: procurementKeys.all });
}

// ─── Vendors ─────────────────────────────────────────────────────────────────
export function useVendors(params: VendorListParams) {
  return useQuery({
    queryKey: procurementKeys.vendors(params),
    queryFn: () => procurementApi.listVendors(params),
    placeholderData: (previous) => previous,
  });
}

export function useVendorStats() {
  return useQuery({ queryKey: procurementKeys.vendorStats(), queryFn: () => procurementApi.vendorStats() });
}

export function useCreateVendor() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: VendorPayload) => procurementApi.createVendor(p), onSuccess: invalidate });
}

export function useUpdateVendor(id: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (p: Partial<VendorPayload>) => procurementApi.updateVendor(id, p),
    onSuccess: invalidate,
  });
}

export function useChangeVendorStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      procurementApi.changeVendorStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useDeleteVendor() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => procurementApi.deleteVendor(id), onSuccess: invalidate });
}

// ─── Purchase orders ─────────────────────────────────────────────────────────
export function useOrders(params: OrderListParams) {
  return useQuery({
    queryKey: procurementKeys.orders(params),
    queryFn: () => procurementApi.listOrders(params),
    placeholderData: (previous) => previous,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: procurementKeys.order(id ?? ''),
    queryFn: () => procurementApi.getOrder(id as string),
    enabled: Boolean(id),
  });
}

export function useOrderStats() {
  return useQuery({ queryKey: procurementKeys.orderStats(), queryFn: () => procurementApi.orderStats() });
}

export function useCreateOrder() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (p: OrderPayload) => procurementApi.createOrder(p), onSuccess: invalidate });
}

export function useDeleteOrder() {
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (id: string) => procurementApi.deleteOrder(id), onSuccess: invalidate });
}

export function useOrderAction() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (args:
      | { action: 'submit' | 'receive' | 'cancel'; id: string }
      | { action: 'decide'; id: string; status: 'approved' | 'rejected'; note?: string }) => {
      switch (args.action) {
        case 'submit':
          return procurementApi.submitOrder(args.id);
        case 'receive':
          return procurementApi.receiveOrder(args.id);
        case 'cancel':
          return procurementApi.cancelOrder(args.id);
        case 'decide':
          return procurementApi.decideOrder(args.id, args.status, args.note);
      }
    },
    onSuccess: invalidate,
  });
}
