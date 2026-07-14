export const WAREHOUSES = [
  'Main Warehouse',
  'East Depot',
  'West Depot',
  'Retail Store',
] as const;
export type Warehouse = (typeof WAREHOUSES)[number];

export const INVENTORY_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Stationery',
  'Consumables',
  'Hardware',
  'Packaging',
  'Raw Materials',
] as const;
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export const INVENTORY_UNITS = ['Piece', 'Box', 'Pack', 'Set', 'Kilogram', 'Liter'] as const;
export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

export interface InventoryItemDto {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  warehouse: string;
  stockValue: number;
  lowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalItems: number;
  totalStockValue: number;
  lowStock: number;
  outOfStock: number;
}

export const StockMovementType = {
  In: 'in',
  Out: 'out',
  Adjustment: 'adjustment',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];
export const STOCK_MOVEMENT_TYPES: readonly StockMovementType[] = Object.values(StockMovementType);
export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  [StockMovementType.In]: 'Stock In',
  [StockMovementType.Out]: 'Stock Out',
  [StockMovementType.Adjustment]: 'Adjustment',
};

export interface StockMovementDto {
  id: string;
  itemId: string;
  type: StockMovementType;
  quantity: number;
  resultingQuantity: number;
  reason?: string;
  reference?: string;
  byName?: string;
  createdAt: string;
}

/** True when stock is at or below the reorder threshold. */
export function isLowStock(quantity: number, reorderLevel: number): boolean {
  return reorderLevel > 0 && quantity <= reorderLevel;
}
