// ─── Vendors ─────────────────────────────────────────────────────────────────
export const VENDOR_CATEGORIES = [
  'Office Supplies',
  'IT Equipment',
  'Software',
  'Professional Services',
  'Logistics',
  'Raw Materials',
  'Marketing',
  'Facilities',
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VendorStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Suspended: 'suspended',
} as const;
export type VendorStatus = (typeof VendorStatus)[keyof typeof VendorStatus];
export const VENDOR_STATUSES: readonly VendorStatus[] = Object.values(VendorStatus);
export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  [VendorStatus.Pending]: 'Pending',
  [VendorStatus.Approved]: 'Approved',
  [VendorStatus.Rejected]: 'Rejected',
  [VendorStatus.Suspended]: 'Suspended',
};

export const VENDOR_STATUS_TRANSITIONS: Record<VendorStatus, VendorStatus[]> = {
  [VendorStatus.Pending]: [VendorStatus.Approved, VendorStatus.Rejected],
  [VendorStatus.Approved]: [VendorStatus.Suspended],
  [VendorStatus.Suspended]: [VendorStatus.Approved],
  [VendorStatus.Rejected]: [],
};

export interface VendorDto {
  id: string;
  code: string;
  name: string;
  contactName?: string;
  email: string;
  phone?: string;
  address?: string;
  category: string;
  status: VendorStatus;
  taxId?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorStats {
  total: number;
  pending: number;
  approved: number;
  suspended: number;
}

// ─── Purchase orders ─────────────────────────────────────────────────────────
export const PurchaseOrderStatus = {
  Draft: 'draft',
  Submitted: 'submitted',
  Approved: 'approved',
  Rejected: 'rejected',
  Received: 'received',
  Cancelled: 'cancelled',
} as const;
export type PurchaseOrderStatus = (typeof PurchaseOrderStatus)[keyof typeof PurchaseOrderStatus];
export const PURCHASE_ORDER_STATUSES: readonly PurchaseOrderStatus[] =
  Object.values(PurchaseOrderStatus);
export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Draft]: 'Draft',
  [PurchaseOrderStatus.Submitted]: 'Submitted',
  [PurchaseOrderStatus.Approved]: 'Approved',
  [PurchaseOrderStatus.Rejected]: 'Rejected',
  [PurchaseOrderStatus.Received]: 'Received',
  [PurchaseOrderStatus.Cancelled]: 'Cancelled',
};

export interface PurchaseOrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface PurchaseOrderDto {
  id: string;
  code: string;
  vendorId: string;
  vendorName: string;
  title: string;
  description?: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: PurchaseOrderStatus;
  expectedDate?: string;
  approverName?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderStats {
  total: number;
  submitted: number;
  approved: number;
  totalValue: number;
}

/** Computes item amounts, subtotal, tax, and grand total for a purchase order. */
export function computeOrderTotals(
  items: { name: string; quantity: number; unitPrice: number }[],
  taxRate: number,
): { items: PurchaseOrderItem[]; subtotal: number; taxAmount: number; total: number } {
  const priced = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    amount: Math.round(item.quantity * item.unitPrice * 100) / 100,
  }));
  const subtotal = Math.round(priced.reduce((sum, i) => sum + i.amount, 0) * 100) / 100;
  const taxAmount = Math.round(subtotal * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;
  return { items: priced, subtotal, taxAmount, total };
}
