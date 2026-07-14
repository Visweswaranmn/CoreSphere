import {
  type DealDto,
  DEAL_STAGE_PROBABILITY,
  DealStage,
  isOpenStage,
  type SalesStats,
} from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { formatCode, nextSequence } from '../../utils/sequence';
import { customerRepository } from '../crm/customer.repository';
import { dealRepository } from './deal.repository';
import { toDealDto } from './deal.model';
import type { CreateDealInput, DealStageInput, ListDealsQuery, UpdateDealInput } from './deal.schemas';

async function assertCustomer(id: string): Promise<void> {
  const customer = await customerRepository.findById(id);
  if (!customer) throw ApiError.badRequest('The selected customer does not exist');
}

export const dealService = {
  async list(query: ListDealsQuery): Promise<{ items: DealDto[]; total: number }> {
    const { items, total } = await dealRepository.findPaginated(query);
    return { items: items.map(toDealDto), total };
  },

  async getById(id: string): Promise<DealDto> {
    const deal = await dealRepository.findById(id);
    if (!deal) throw ApiError.notFound('Deal not found');
    return toDealDto(deal);
  },

  async create(input: CreateDealInput): Promise<DealDto> {
    await assertCustomer(input.customerId);
    const code = formatCode('DEAL', await nextSequence('deal'));
    const created = await dealRepository.create({
      code,
      title: input.title,
      customer: input.customerId as unknown as never,
      value: input.value,
      stage: input.stage ?? DealStage.Lead,
      expectedCloseDate: input.expectedCloseDate ?? null,
      ...(input.notes ? { notes: input.notes } : {}),
    });
    const deal = await dealRepository.findById(created.id as string);
    return toDealDto(deal!);
  },

  async update(id: string, input: UpdateDealInput): Promise<DealDto> {
    const deal = await dealRepository.findByIdRaw(id);
    if (!deal) throw ApiError.notFound('Deal not found');

    if (input.customerId !== undefined) {
      await assertCustomer(input.customerId);
      deal.customer = input.customerId as unknown as never;
    }
    if (input.title !== undefined) deal.title = input.title;
    if (input.value !== undefined) deal.value = input.value;
    if (input.stage !== undefined) deal.stage = input.stage;
    if (input.expectedCloseDate !== undefined) deal.expectedCloseDate = input.expectedCloseDate;
    if (input.notes !== undefined) deal.notes = input.notes;

    await deal.save();
    const updated = await dealRepository.findById(id);
    return toDealDto(updated!);
  },

  async changeStage(id: string, input: DealStageInput): Promise<DealDto> {
    const deal = await dealRepository.findByIdRaw(id);
    if (!deal) throw ApiError.notFound('Deal not found');
    deal.stage = input.stage;
    await deal.save();
    const updated = await dealRepository.findById(id);
    return toDealDto(updated!);
  },

  async remove(id: string): Promise<void> {
    const deleted = await dealRepository.deleteById(id);
    if (!deleted) throw ApiError.notFound('Deal not found');
  },

  async stats(): Promise<SalesStats> {
    const rows = await dealRepository.stageAggregation();

    let openDeals = 0;
    let openValue = 0;
    let weightedValue = 0;
    let wonValue = 0;
    let wonCount = 0;
    let lostCount = 0;

    for (const row of rows) {
      if (isOpenStage(row.stage)) {
        openDeals += row.count;
        openValue += row.value;
        weightedValue += row.value * (DEAL_STAGE_PROBABILITY[row.stage] / 100);
      } else if (row.stage === DealStage.Won) {
        wonValue += row.value;
        wonCount += row.count;
      } else if (row.stage === DealStage.Lost) {
        lostCount += row.count;
      }
    }

    const decided = wonCount + lostCount;
    return {
      openDeals,
      openValue: Math.round(openValue * 100) / 100,
      weightedValue: Math.round(weightedValue * 100) / 100,
      wonValue: Math.round(wonValue * 100) / 100,
      winRate: decided > 0 ? Math.round((wonCount / decided) * 100) : 0,
    };
  },
};
