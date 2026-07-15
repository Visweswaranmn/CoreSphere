import { type FilterQuery } from 'mongoose';
import { DocumentModel, type DocumentAttrs, type DocumentDoc, type DocumentHydrated } from './document.model';
import type { ListDocumentsQuery } from './document.schemas';

const UPLOADER_POPULATE = { path: 'uploadedBy', select: 'firstName lastName' };

function buildFilter(query: ListDocumentsQuery): FilterQuery<DocumentDoc> {
  const filter: FilterQuery<DocumentDoc> = {};
  if (query.category) filter.category = query.category;
  if (query.search) {
    const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { originalName: rx }];
  }
  return filter;
}

export const documentRepository = {
  async findPaginated(query: ListDocumentsQuery): Promise<{ items: DocumentHydrated[]; total: number }> {
    const filter = buildFilter(query);
    const [items, total] = await Promise.all([
      DocumentModel.find(filter)
        .populate(UPLOADER_POPULATE)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.pageSize)
        .limit(query.pageSize)
        .exec(),
      DocumentModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  findById(id: string): Promise<DocumentHydrated | null> {
    return DocumentModel.findById(id).populate(UPLOADER_POPULATE).exec();
  },

  findByIdRaw(id: string): Promise<DocumentHydrated | null> {
    return DocumentModel.findById(id).exec();
  },

  create(attrs: DocumentAttrs): Promise<DocumentHydrated> {
    return DocumentModel.create(attrs);
  },

  async deleteById(id: string): Promise<boolean> {
    const res = await DocumentModel.findByIdAndDelete(id).exec();
    return res !== null;
  },

  async stats(): Promise<{ total: number; totalSize: number; byCategory: { category: string; count: number }[] }> {
    const [total, sizeAgg, byCategoryRaw] = await Promise.all([
      DocumentModel.countDocuments().exec(),
      DocumentModel.aggregate<{ size: number }>([
        { $group: { _id: null, size: { $sum: '$size' } } },
      ]).exec(),
      DocumentModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).exec(),
    ]);
    return {
      total,
      totalSize: sizeAgg[0]?.size ?? 0,
      byCategory: byCategoryRaw.map((row) => ({ category: row._id, count: row.count })),
    };
  },
};
