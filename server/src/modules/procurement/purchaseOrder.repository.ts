import { type FilterQuery } from 'mongoose';
import {
  PurchaseOrderModel,
  type PurchaseOrderAttrs,
  type PurchaseOrderDoc,
  type PurchaseOrderHydrated,
} from './purchaseOrder.model';
import type { ListOrdersQuery } from './procurement.schemas';

const VENDOR_POPULATE = { path: 'vendor', select: 'name' };
const APPROVER_POPULATE = { path: 'approver', select: 'firstName lastName' };

function buildFilter(query: ListOrdersQuery): FilterQuery<PurchaseOrderDoc> {
  const filter: FilterQuery<PurchaseOrderDoc> = {};
  if (query.status) filter.status = query.status;
  if (query.vendorId) filter.vendor = query.vendorId;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ code: rx }, { title: rx }];
  }
  return filter;
}

export const purchaseOrderRepository = {
  async findPaginated(
    query: ListOrdersQuery,
  ): Promise<{ items: PurchaseOrderHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      PurchaseOrderModel.find(filter)
        .populate(VENDOR_POPULATE)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      PurchaseOrderModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<PurchaseOrderHydrated | null> {
    return PurchaseOrderModel.findById(id).populate(VENDOR_POPULATE).populate(APPROVER_POPULATE).exec();
  },

  findByIdRaw(id: string): Promise<PurchaseOrderHydrated | null> {
    return PurchaseOrderModel.findById(id).exec();
  },

  create(attrs: PurchaseOrderAttrs): Promise<PurchaseOrderHydrated> {
    return PurchaseOrderModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await PurchaseOrderModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async stats(): Promise<{ total: number; submitted: number; approved: number; totalValue: number }> {
    const [total, submitted, approved, valueAgg] = await Promise.all([
      PurchaseOrderModel.countDocuments().exec(),
      PurchaseOrderModel.countDocuments({ status: 'submitted' }).exec(),
      PurchaseOrderModel.countDocuments({ status: 'approved' }).exec(),
      PurchaseOrderModel.aggregate<{ value: number }>([
        { $match: { status: { $in: ['approved', 'received'] } } },
        { $group: { _id: null, value: { $sum: '$total' } } },
      ]).exec(),
    ]);
    return { total, submitted, approved, totalValue: valueAgg[0]?.value ?? 0 };
  },
};
