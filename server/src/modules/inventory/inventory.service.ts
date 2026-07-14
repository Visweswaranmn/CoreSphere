import {
  type InventoryItemDto,
  type InventoryStats,
  type StockMovementDto,
  StockMovementType,
} from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { inventoryItemRepository } from './inventoryItem.repository';
import { stockMovementRepository } from './stockMovement.repository';
import { toInventoryItemDto } from './inventoryItem.model';
import { toStockMovementDto } from './stockMovement.model';
import type { CreateItemInput, ListItemsQuery, MovementInput, UpdateItemInput } from './inventory.schemas';

export const inventoryService = {
  async list(query: ListItemsQuery): Promise<{ items: InventoryItemDto[]; total: number }> {
    const { items, total } = await inventoryItemRepository.findPaginated(query);
    return { items: items.map(toInventoryItemDto), total };
  },

  async getById(id: string): Promise<InventoryItemDto> {
    const item = await inventoryItemRepository.findById(id);
    if (!item) throw ApiError.notFound('Inventory item not found');
    return toInventoryItemDto(item);
  },

  async create(input: CreateItemInput): Promise<InventoryItemDto> {
    const code = formatCode('ITM', await nextSequence('inventoryItem'));
    const item = await inventoryItemRepository.create({
      code,
      name: input.name,
      category: input.category,
      unit: input.unit,
      quantity: input.quantity,
      reorderLevel: input.reorderLevel,
      unitCost: input.unitCost,
      warehouse: input.warehouse,
    });
    return toInventoryItemDto(item);
  },

  async update(id: string, input: UpdateItemInput): Promise<InventoryItemDto> {
    const item = await inventoryItemRepository.findById(id);
    if (!item) throw ApiError.notFound('Inventory item not found');

    if (input.name !== undefined) item.name = input.name;
    if (input.category !== undefined) item.category = input.category;
    if (input.unit !== undefined) item.unit = input.unit;
    if (input.reorderLevel !== undefined) item.reorderLevel = input.reorderLevel;
    if (input.unitCost !== undefined) item.unitCost = input.unitCost;
    if (input.warehouse !== undefined) item.warehouse = input.warehouse;

    await item.save();
    return toInventoryItemDto(item);
  },

  async remove(id: string): Promise<void> {
    const item = await inventoryItemRepository.findById(id);
    if (!item) throw ApiError.notFound('Inventory item not found');
    await stockMovementRepository.deleteByItem(id);
    await inventoryItemRepository.deleteById(id);
  },

  /** Applies a stock movement and records it in the item's audit history. */
  async recordMovement(itemId: string, userId: string, input: MovementInput): Promise<InventoryItemDto> {
    const item = await inventoryItemRepository.findById(itemId);
    if (!item) throw ApiError.notFound('Inventory item not found');

    let nextQuantity: number;
    if (input.type === StockMovementType.In) {
      nextQuantity = item.quantity + input.quantity;
    } else if (input.type === StockMovementType.Out) {
      if (input.quantity > item.quantity) {
        throw ApiError.badRequest('Insufficient stock for this movement');
      }
      nextQuantity = item.quantity - input.quantity;
    } else {
      nextQuantity = input.quantity;
    }

    item.quantity = nextQuantity;
    await item.save();

    await stockMovementRepository.create({
      item: item._id,
      type: input.type,
      quantity: input.quantity,
      resultingQuantity: nextQuantity,
      ...(input.reason ? { reason: input.reason } : {}),
      ...(input.reference ? { reference: input.reference } : {}),
      by: userId as unknown as never,
    });

    return toInventoryItemDto(item);
  },

  async listMovements(itemId: string): Promise<StockMovementDto[]> {
    const item = await inventoryItemRepository.findById(itemId);
    if (!item) throw ApiError.notFound('Inventory item not found');
    const movements = await stockMovementRepository.findByItem(itemId);
    return movements.map(toStockMovementDto);
  },

  async stats(): Promise<InventoryStats> {
    return inventoryItemRepository.stats();
  },
};
