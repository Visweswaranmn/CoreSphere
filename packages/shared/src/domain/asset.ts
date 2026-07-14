export const ASSET_CATEGORIES = [
  'Laptop',
  'Desktop',
  'Monitor',
  'Phone',
  'Furniture',
  'Vehicle',
  'Peripheral',
  'Software License',
] as const;
export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const AssetStatus = {
  Available: 'available',
  Assigned: 'assigned',
  Maintenance: 'maintenance',
  Retired: 'retired',
} as const;
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];
export const ASSET_STATUSES: readonly AssetStatus[] = Object.values(AssetStatus);
export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.Available]: 'Available',
  [AssetStatus.Assigned]: 'Assigned',
  [AssetStatus.Maintenance]: 'Maintenance',
  [AssetStatus.Retired]: 'Retired',
};

/** Manual status transitions (assignment/return are handled by dedicated actions). */
export const ASSET_STATUS_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  [AssetStatus.Available]: [AssetStatus.Maintenance, AssetStatus.Retired],
  [AssetStatus.Assigned]: [],
  [AssetStatus.Maintenance]: [AssetStatus.Available, AssetStatus.Retired],
  [AssetStatus.Retired]: [],
};

export interface AssetDto {
  id: string;
  code: string;
  name: string;
  category: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  status: AssetStatus;
  assignedToId?: string;
  assignedToName?: string;
  assignedAt?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetStats {
  total: number;
  available: number;
  assigned: number;
  maintenance: number;
}
