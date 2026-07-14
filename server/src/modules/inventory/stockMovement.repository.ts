import {
  StockMovementModel,
  type StockMovementAttrs,
  type StockMovementHydrated,
} from './stockMovement.model';

export const stockMovementRepository = {
  create(attrs: StockMovementAttrs): Promise<StockMovementHydrated> {
    return StockMovementModel.create(attrs);
  },

  findByItem(itemId: string, limit = 50): Promise<StockMovementHydrated[]> {
    return StockMovementModel.find({ item: itemId })
      .populate({ path: 'by', select: 'firstName lastName' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  deleteByItem(itemId: string): Promise<unknown> {
    return StockMovementModel.deleteMany({ item: itemId }).exec();
  },
};
