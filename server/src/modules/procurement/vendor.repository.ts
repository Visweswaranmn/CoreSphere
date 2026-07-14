import { type FilterQuery } from 'mongoose';
import { VendorModel, type VendorAttrs, type VendorDoc, type VendorHydrated } from './vendor.model';
import type { ListVendorsQuery } from './procurement.schemas';

function buildFilter(query: ListVendorsQuery): FilterQuery<VendorDoc> {
  const filter: FilterQuery<VendorDoc> = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { code: rx }, { email: rx }, { contactName: rx }];
  }
  return filter;
}

export const vendorRepository = {
  async findPaginated(query: ListVendorsQuery): Promise<{ items: VendorHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      VendorModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      VendorModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<VendorHydrated | null> {
    return VendorModel.findById(id).exec();
  },

  existsByEmail(email: string): Promise<boolean> {
    return VendorModel.exists({ email: email.toLowerCase() })
      .exec()
      .then((doc) => doc !== null);
  },

  create(attrs: VendorAttrs): Promise<VendorHydrated> {
    return VendorModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await VendorModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async stats(): Promise<{ total: number; pending: number; approved: number; suspended: number }> {
    const [total, pending, approved, suspended] = await Promise.all([
      VendorModel.countDocuments().exec(),
      VendorModel.countDocuments({ status: 'pending' }).exec(),
      VendorModel.countDocuments({ status: 'approved' }).exec(),
      VendorModel.countDocuments({ status: 'suspended' }).exec(),
    ]);
    return { total, pending, approved, suspended };
  },
};
