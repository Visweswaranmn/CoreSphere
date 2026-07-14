import { type FilterQuery } from 'mongoose';
import type { DealStage } from '@coresphere/shared';
import { DealModel, type DealAttrs, type DealDoc, type DealHydrated } from './deal.model';
import type { ListDealsQuery } from './deal.schemas';

const CUSTOMER_POPULATE = { path: 'customer', select: 'name' };

function buildFilter(query: ListDealsQuery): FilterQuery<DealDoc> {
  const filter: FilterQuery<DealDoc> = {};
  if (query.stage) filter.stage = query.stage;
  if (query.customerId) filter.customer = query.customerId;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: rx }, { code: rx }];
  }
  return filter;
}

export const dealRepository = {
  async findPaginated(query: ListDealsQuery): Promise<{ items: DealHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      DealModel.find(filter)
        .populate(CUSTOMER_POPULATE)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      DealModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<DealHydrated | null> {
    return DealModel.findById(id).populate(CUSTOMER_POPULATE).exec();
  },

  findByIdRaw(id: string): Promise<DealHydrated | null> {
    return DealModel.findById(id).exec();
  },

  create(attrs: DealAttrs): Promise<DealHydrated> {
    return DealModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await DealModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  deleteByCustomer(customerId: string): Promise<unknown> {
    return DealModel.deleteMany({ customer: customerId }).exec();
  },

  /** Per-stage deal counts and value sums for pipeline analytics. */
  stageAggregation(): Promise<{ stage: DealStage; count: number; value: number }[]> {
    return DealModel.aggregate<{ stage: DealStage; count: number; value: number }>([
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } },
      { $project: { _id: 0, stage: '$_id', count: 1, value: 1 } },
    ]).exec();
  },
};
