import { type FilterQuery } from 'mongoose';
import { CustomerModel, type CustomerAttrs, type CustomerDoc, type CustomerHydrated } from './customer.model';
import type { ListCustomersQuery } from './customer.schemas';

function buildFilter(query: ListCustomersQuery): FilterQuery<CustomerDoc> {
  const filter: FilterQuery<CustomerDoc> = {};
  if (query.status) filter.status = query.status;
  if (query.industry) filter.industry = query.industry;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { code: rx }, { email: rx }, { contactName: rx }];
  }
  return filter;
}

export const customerRepository = {
  async findPaginated(query: ListCustomersQuery): Promise<{ items: CustomerHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      CustomerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      CustomerModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<CustomerHydrated | null> {
    return CustomerModel.findById(id).exec();
  },

  existsByEmail(email: string): Promise<boolean> {
    return CustomerModel.exists({ email: email.toLowerCase() })
      .exec()
      .then((doc) => doc !== null);
  },

  create(attrs: CustomerAttrs): Promise<CustomerHydrated> {
    return CustomerModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await CustomerModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async stats(): Promise<{ total: number; active: number; prospect: number }> {
    const [total, active, prospect] = await Promise.all([
      CustomerModel.countDocuments().exec(),
      CustomerModel.countDocuments({ status: 'active' }).exec(),
      CustomerModel.countDocuments({ status: 'prospect' }).exec(),
    ]);
    return { total, active, prospect };
  },
};
