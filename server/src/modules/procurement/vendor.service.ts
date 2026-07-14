import { type VendorDto, type VendorStats, VENDOR_STATUS_TRANSITIONS } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { vendorRepository } from './vendor.repository';
import { toVendorDto } from './vendor.model';
import type {
  CreateVendorInput,
  ListVendorsQuery,
  UpdateVendorInput,
  VendorStatusInput,
} from './procurement.schemas';

export const vendorService = {
  async list(query: ListVendorsQuery): Promise<{ items: VendorDto[]; total: number }> {
    const { items, total } = await vendorRepository.findPaginated(query);
    return { items: items.map(toVendorDto), total };
  },

  async getById(id: string): Promise<VendorDto> {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw ApiError.notFound('Vendor not found');
    return toVendorDto(vendor);
  },

  async create(input: CreateVendorInput): Promise<VendorDto> {
    if (await vendorRepository.existsByEmail(input.email)) {
      throw ApiError.conflict('A vendor with this email already exists');
    }
    const code = formatCode('VEN', await nextSequence('vendor'));
    const vendor = await vendorRepository.create({
      code,
      name: input.name,
      ...(input.contactName ? { contactName: input.contactName } : {}),
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.address ? { address: input.address } : {}),
      category: input.category,
      status: 'pending',
      ...(input.taxId ? { taxId: input.taxId } : {}),
      ...(input.website ? { website: input.website } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    });
    return toVendorDto(vendor);
  },

  async update(id: string, input: UpdateVendorInput): Promise<VendorDto> {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw ApiError.notFound('Vendor not found');

    if (input.email && input.email !== vendor.email) {
      if (await vendorRepository.existsByEmail(input.email)) {
        throw ApiError.conflict('A vendor with this email already exists');
      }
      vendor.email = input.email;
    }
    if (input.name !== undefined) vendor.name = input.name;
    if (input.contactName !== undefined) vendor.contactName = input.contactName;
    if (input.phone !== undefined) vendor.phone = input.phone;
    if (input.address !== undefined) vendor.address = input.address;
    if (input.category !== undefined) vendor.category = input.category;
    if (input.taxId !== undefined) vendor.taxId = input.taxId;
    if (input.website !== undefined) vendor.website = input.website;
    if (input.notes !== undefined) vendor.notes = input.notes;

    await vendor.save();
    return toVendorDto(vendor);
  },

  async changeStatus(id: string, input: VendorStatusInput): Promise<VendorDto> {
    const vendor = await vendorRepository.findById(id);
    if (!vendor) throw ApiError.notFound('Vendor not found');

    const allowed = VENDOR_STATUS_TRANSITIONS[vendor.status];
    if (input.status !== vendor.status && !allowed.includes(input.status)) {
      throw ApiError.badRequest(`Cannot change status from '${vendor.status}' to '${input.status}'`);
    }
    vendor.status = input.status;
    await vendor.save();
    return toVendorDto(vendor);
  },

  async remove(id: string): Promise<void> {
    const deleted = await vendorRepository.deleteById(id);
    if (!deleted) throw ApiError.notFound('Vendor not found');
  },

  async stats(): Promise<VendorStats> {
    return vendorRepository.stats();
  },
};
