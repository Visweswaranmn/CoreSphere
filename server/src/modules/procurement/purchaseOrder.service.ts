import {
  computeOrderTotals,
  type PurchaseOrderDto,
  type PurchaseOrderStats,
  PurchaseOrderStatus,
  VendorStatus,
} from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { vendorRepository } from './vendor.repository';
import { purchaseOrderRepository } from './purchaseOrder.repository';
import { toPurchaseOrderDto } from './purchaseOrder.model';
import type {
  CreateOrderInput,
  ListOrdersQuery,
  OrderDecisionInput,
  UpdateOrderInput,
} from './procurement.schemas';

async function loadDraft(id: string) {
  const order = await purchaseOrderRepository.findByIdRaw(id);
  if (!order) throw ApiError.notFound('Purchase order not found');
  return order;
}

async function reload(id: string): Promise<PurchaseOrderDto> {
  const order = await purchaseOrderRepository.findById(id);
  return toPurchaseOrderDto(order!);
}

export const purchaseOrderService = {
  async list(query: ListOrdersQuery): Promise<{ items: PurchaseOrderDto[]; total: number }> {
    const { items, total } = await purchaseOrderRepository.findPaginated(query);
    return { items: items.map(toPurchaseOrderDto), total };
  },

  async getById(id: string): Promise<PurchaseOrderDto> {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) throw ApiError.notFound('Purchase order not found');
    return toPurchaseOrderDto(order);
  },

  async create(input: CreateOrderInput): Promise<PurchaseOrderDto> {
    const vendor = await vendorRepository.findById(input.vendorId);
    if (!vendor) throw ApiError.badRequest('The selected vendor does not exist');
    if (vendor.status !== VendorStatus.Approved) {
      throw ApiError.badRequest('Purchase orders can only be raised for approved vendors');
    }

    const totals = computeOrderTotals(input.items, input.taxRate);
    const code = formatCode('PO', await nextSequence('purchaseOrder'));

    const order = await purchaseOrderRepository.create({
      code,
      vendor: vendor._id,
      title: input.title,
      ...(input.description ? { description: input.description } : {}),
      items: totals.items,
      subtotal: totals.subtotal,
      taxRate: input.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      status: PurchaseOrderStatus.Draft,
      expectedDate: input.expectedDate ?? null,
      approver: null,
      decidedAt: null,
    });
    return reload(order.id as string);
  },

  async update(id: string, input: UpdateOrderInput): Promise<PurchaseOrderDto> {
    const order = await loadDraft(id);
    if (order.status !== PurchaseOrderStatus.Draft) {
      throw ApiError.badRequest('Only draft orders can be edited');
    }

    if (input.title !== undefined) order.title = input.title;
    if (input.description !== undefined) order.description = input.description;
    if (input.expectedDate !== undefined) order.expectedDate = input.expectedDate;

    const nextTaxRate = input.taxRate ?? order.taxRate;
    if (input.items !== undefined || input.taxRate !== undefined) {
      const sourceItems = input.items ?? order.items;
      const totals = computeOrderTotals(sourceItems, nextTaxRate);
      order.items = totals.items;
      order.subtotal = totals.subtotal;
      order.taxRate = nextTaxRate;
      order.taxAmount = totals.taxAmount;
      order.total = totals.total;
    }

    await order.save();
    return reload(id);
  },

  async submit(id: string): Promise<PurchaseOrderDto> {
    const order = await loadDraft(id);
    if (order.status !== PurchaseOrderStatus.Draft) {
      throw ApiError.badRequest('Only draft orders can be submitted');
    }
    if (order.items.length === 0) {
      throw ApiError.badRequest('Add at least one item before submitting');
    }
    order.status = PurchaseOrderStatus.Submitted;
    await order.save();
    return reload(id);
  },

  async decide(id: string, approverUserId: string, input: OrderDecisionInput): Promise<PurchaseOrderDto> {
    const order = await loadDraft(id);
    if (order.status !== PurchaseOrderStatus.Submitted) {
      throw ApiError.badRequest('Only submitted orders can be approved or rejected');
    }
    order.status = input.status;
    order.approver = approverUserId as unknown as never;
    order.decisionNote = input.note;
    order.decidedAt = new Date();
    await order.save();
    return reload(id);
  },

  async receive(id: string): Promise<PurchaseOrderDto> {
    const order = await loadDraft(id);
    if (order.status !== PurchaseOrderStatus.Approved) {
      throw ApiError.badRequest('Only approved orders can be marked as received');
    }
    order.status = PurchaseOrderStatus.Received;
    await order.save();
    return reload(id);
  },

  async cancel(id: string): Promise<PurchaseOrderDto> {
    const order = await loadDraft(id);
    const cancellable: string[] = [
      PurchaseOrderStatus.Draft,
      PurchaseOrderStatus.Submitted,
      PurchaseOrderStatus.Approved,
    ];
    if (!cancellable.includes(order.status)) {
      throw ApiError.badRequest(`A ${order.status} order cannot be cancelled`);
    }
    order.status = PurchaseOrderStatus.Cancelled;
    await order.save();
    return reload(id);
  },

  async remove(id: string): Promise<void> {
    const order = await loadDraft(id);
    if (order.status !== PurchaseOrderStatus.Draft) {
      throw ApiError.badRequest('Only draft orders can be deleted');
    }
    await purchaseOrderRepository.deleteById(id);
  },

  async stats(): Promise<PurchaseOrderStats> {
    return purchaseOrderRepository.stats();
  },
};
