import { type FilterQuery } from 'mongoose';
import { AssetModel, type AssetAttrs, type AssetDoc, type AssetHydrated } from './asset.model';
import type { ListAssetsQuery } from './asset.schemas';

const ASSIGNEE_POPULATE = { path: 'assignedTo', select: 'firstName lastName' };

function buildFilter(query: ListAssetsQuery): FilterQuery<AssetDoc> {
  const filter: FilterQuery<AssetDoc> = {};
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { code: rx }, { serialNumber: rx }];
  }
  return filter;
}

export const assetRepository = {
  async findPaginated(query: ListAssetsQuery): Promise<{ items: AssetHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      AssetModel.find(filter)
        .populate(ASSIGNEE_POPULATE)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      AssetModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<AssetHydrated | null> {
    return AssetModel.findById(id).populate(ASSIGNEE_POPULATE).exec();
  },

  findByIdRaw(id: string): Promise<AssetHydrated | null> {
    return AssetModel.findById(id).exec();
  },

  create(attrs: AssetAttrs): Promise<AssetHydrated> {
    return AssetModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await AssetModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async stats(): Promise<{ total: number; available: number; assigned: number; maintenance: number }> {
    const [total, available, assigned, maintenance] = await Promise.all([
      AssetModel.countDocuments().exec(),
      AssetModel.countDocuments({ status: 'available' }).exec(),
      AssetModel.countDocuments({ status: 'assigned' }).exec(),
      AssetModel.countDocuments({ status: 'maintenance' }).exec(),
    ]);
    return { total, available, assigned, maintenance };
  },
};
