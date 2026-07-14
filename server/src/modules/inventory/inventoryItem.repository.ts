import { type FilterQuery } from 'mongoose';
import {
  InventoryItemModel,
  type InventoryItemAttrs,
  type InventoryItemDoc,
  type InventoryItemHydrated,
} from './inventoryItem.model';
import type { ListItemsQuery } from './inventory.schemas';

const LOW_STOCK_EXPR = {
  $expr: { $and: [{ $gt: ['$reorderLevel', 0] }, { $lte: ['$quantity', '$reorderLevel'] }] },
};

function buildFilter(query: ListItemsQuery): FilterQuery<InventoryItemDoc> {
  const filter: FilterQuery<InventoryItemDoc> = {};
  if (query.category) filter.category = query.category;
  if (query.warehouse) filter.warehouse = query.warehouse;
  if (query.lowStock === 'true') Object.assign(filter, LOW_STOCK_EXPR);
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { code: rx }];
  }
  return filter;
}

export const inventoryItemRepository = {
  async findPaginated(query: ListItemsQuery): Promise<{ items: InventoryItemHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      InventoryItemModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      InventoryItemModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<InventoryItemHydrated | null> {
    return InventoryItemModel.findById(id).exec();
  },

  create(attrs: InventoryItemAttrs): Promise<InventoryItemHydrated> {
    return InventoryItemModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await InventoryItemModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async stats(): Promise<{ totalItems: number; totalStockValue: number; lowStock: number; outOfStock: number }> {
    const [totalItems, valueAgg, lowStock, outOfStock] = await Promise.all([
      InventoryItemModel.countDocuments().exec(),
      InventoryItemModel.aggregate<{ value: number }>([
        { $group: { _id: null, value: { $sum: { $multiply: ['$quantity', '$unitCost'] } } } },
      ]).exec(),
      InventoryItemModel.countDocuments(LOW_STOCK_EXPR).exec(),
      InventoryItemModel.countDocuments({ quantity: 0 }).exec(),
    ]);
    return {
      totalItems,
      totalStockValue: Math.round((valueAgg[0]?.value ?? 0) * 100) / 100,
      lowStock,
      outOfStock,
    };
  },
};
