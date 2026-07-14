import { type AssetDto, type AssetStats, ASSET_STATUS_TRANSITIONS, AssetStatus } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { employeeRepository } from '../employees/employee.repository';
import { assetRepository } from './asset.repository';
import { toAssetDto } from './asset.model';
import type {
  AssetStatusInput,
  CreateAssetInput,
  ListAssetsQuery,
  UpdateAssetInput,
} from './asset.schemas';

export const assetService = {
  async list(query: ListAssetsQuery): Promise<{ items: AssetDto[]; total: number }> {
    const { items, total } = await assetRepository.findPaginated(query);
    return { items: items.map(toAssetDto), total };
  },

  async getById(id: string): Promise<AssetDto> {
    const asset = await assetRepository.findById(id);
    if (!asset) throw ApiError.notFound('Asset not found');
    return toAssetDto(asset);
  },

  async create(input: CreateAssetInput): Promise<AssetDto> {
    const code = formatCode('AST', await nextSequence('asset'));
    const asset = await assetRepository.create({
      code,
      name: input.name,
      category: input.category,
      ...(input.serialNumber ? { serialNumber: input.serialNumber } : {}),
      purchaseDate: input.purchaseDate ?? null,
      purchaseCost: input.purchaseCost ?? null,
      status: AssetStatus.Available,
      assignedTo: null,
      assignedAt: null,
      ...(input.location ? { location: input.location } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    });
    return toAssetDto(asset);
  },

  async update(id: string, input: UpdateAssetInput): Promise<AssetDto> {
    const asset = await assetRepository.findByIdRaw(id);
    if (!asset) throw ApiError.notFound('Asset not found');

    if (input.name !== undefined) asset.name = input.name;
    if (input.category !== undefined) asset.category = input.category;
    if (input.serialNumber !== undefined) asset.serialNumber = input.serialNumber;
    if (input.purchaseDate !== undefined) asset.purchaseDate = input.purchaseDate;
    if (input.purchaseCost !== undefined) asset.purchaseCost = input.purchaseCost;
    if (input.location !== undefined) asset.location = input.location;
    if (input.notes !== undefined) asset.notes = input.notes;

    await asset.save();
    const updated = await assetRepository.findById(id);
    return toAssetDto(updated!);
  },

  async assign(id: string, employeeId: string): Promise<AssetDto> {
    const asset = await assetRepository.findByIdRaw(id);
    if (!asset) throw ApiError.notFound('Asset not found');
    if (asset.status !== AssetStatus.Available) {
      throw ApiError.badRequest('Only available assets can be assigned');
    }
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) throw ApiError.badRequest('The selected employee does not exist');

    asset.assignedTo = employee._id;
    asset.assignedAt = new Date();
    asset.status = AssetStatus.Assigned;
    await asset.save();
    const updated = await assetRepository.findById(id);
    return toAssetDto(updated!);
  },

  async returnAsset(id: string): Promise<AssetDto> {
    const asset = await assetRepository.findByIdRaw(id);
    if (!asset) throw ApiError.notFound('Asset not found');
    if (asset.status !== AssetStatus.Assigned) {
      throw ApiError.badRequest('Only assigned assets can be returned');
    }
    asset.assignedTo = null;
    asset.assignedAt = null;
    asset.status = AssetStatus.Available;
    await asset.save();
    return toAssetDto(asset);
  },

  async changeStatus(id: string, input: AssetStatusInput): Promise<AssetDto> {
    const asset = await assetRepository.findByIdRaw(id);
    if (!asset) throw ApiError.notFound('Asset not found');

    const allowed = ASSET_STATUS_TRANSITIONS[asset.status];
    if (input.status !== asset.status && !allowed.includes(input.status)) {
      throw ApiError.badRequest(`Cannot change status from '${asset.status}' to '${input.status}'`);
    }
    asset.status = input.status;
    await asset.save();
    return toAssetDto(asset);
  },

  async remove(id: string): Promise<void> {
    const deleted = await assetRepository.deleteById(id);
    if (!deleted) throw ApiError.notFound('Asset not found');
  },

  async stats(): Promise<AssetStats> {
    return assetRepository.stats();
  },
};
