import { type CustomerDto, type CustomerStats, CustomerStatus } from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { dealRepository } from '../sales/deal.repository';
import { customerRepository } from './customer.repository';
import { toCustomerDto } from './customer.model';
import type { CreateCustomerInput, ListCustomersQuery, UpdateCustomerInput } from './customer.schemas';

export const customerService = {
  async list(query: ListCustomersQuery): Promise<{ items: CustomerDto[]; total: number }> {
    const { items, total } = await customerRepository.findPaginated(query);
    return { items: items.map(toCustomerDto), total };
  },

  async getById(id: string): Promise<CustomerDto> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    return toCustomerDto(customer);
  },

  async create(input: CreateCustomerInput): Promise<CustomerDto> {
    if (await customerRepository.existsByEmail(input.email)) {
      throw ApiError.conflict('A customer with this email already exists');
    }
    const code = formatCode('CUS', await nextSequence('customer'));
    const customer = await customerRepository.create({
      code,
      name: input.name,
      ...(input.contactName ? { contactName: input.contactName } : {}),
      email: input.email,
      ...(input.phone ? { phone: input.phone } : {}),
      industry: input.industry,
      status: input.status ?? CustomerStatus.Prospect,
      ...(input.website ? { website: input.website } : {}),
      ...(input.address ? { address: input.address } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    });
    return toCustomerDto(customer);
  },

  async update(id: string, input: UpdateCustomerInput): Promise<CustomerDto> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');

    if (input.email && input.email !== customer.email) {
      if (await customerRepository.existsByEmail(input.email)) {
        throw ApiError.conflict('A customer with this email already exists');
      }
      customer.email = input.email;
    }
    if (input.name !== undefined) customer.name = input.name;
    if (input.contactName !== undefined) customer.contactName = input.contactName;
    if (input.phone !== undefined) customer.phone = input.phone;
    if (input.industry !== undefined) customer.industry = input.industry;
    if (input.status !== undefined) customer.status = input.status;
    if (input.website !== undefined) customer.website = input.website;
    if (input.address !== undefined) customer.address = input.address;
    if (input.notes !== undefined) customer.notes = input.notes;

    await customer.save();
    return toCustomerDto(customer);
  },

  async remove(id: string): Promise<void> {
    const customer = await customerRepository.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    await dealRepository.deleteByCustomer(id);
    await customerRepository.deleteById(id);
  },

  async stats(): Promise<CustomerStats> {
    return customerRepository.stats();
  },
};
