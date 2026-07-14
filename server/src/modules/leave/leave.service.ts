import {
  type LeaveBalanceDto,
  type LeaveRequestDto,
  LEAVE_ENTITLEMENTS,
  LEAVE_TYPES,
  LeaveStatus,
} from '@coresphere/shared';
import { ApiError } from '../../utils/ApiError';
import { inclusiveDayCount, toUtcDateOnly } from '../../utils/date';
import { employeeRepository } from '../employees/employee.repository';
import { leaveRepository } from './leave.repository';
import { toLeaveDto } from './leave.model';
import type { CreateLeaveInput, DecideLeaveInput, ListLeaveQuery } from './leave.schemas';

export const leaveService = {
  async list(query: ListLeaveQuery): Promise<{ items: LeaveRequestDto[]; total: number }> {
    const { items, total } = await leaveRepository.findPaginated(query);
    return { items: items.map(toLeaveDto), total };
  },

  async create(input: CreateLeaveInput): Promise<LeaveRequestDto> {
    const employee = await employeeRepository.findById(input.employeeId);
    if (!employee) throw ApiError.badRequest('The selected employee does not exist');

    const startDate = toUtcDateOnly(input.startDate);
    const endDate = toUtcDateOnly(input.endDate);
    const days = inclusiveDayCount(startDate, endDate);

    const created = await leaveRepository.create({
      employee: employee._id,
      type: input.type,
      startDate,
      endDate,
      days,
      reason: input.reason,
      status: LeaveStatus.Pending,
      reviewer: null,
      decidedAt: null,
    });
    return toLeaveDto(created);
  },

  async decide(
    id: string,
    reviewerUserId: string,
    input: DecideLeaveInput,
  ): Promise<LeaveRequestDto> {
    const leave = await leaveRepository.findById(id);
    if (!leave) throw ApiError.notFound('Leave request not found');
    if (leave.status !== LeaveStatus.Pending) {
      throw ApiError.badRequest(`This request has already been ${leave.status}`);
    }

    leave.status = input.status;
    leave.reviewer = reviewerUserId as unknown as never;
    leave.decisionNote = input.note;
    leave.decidedAt = new Date();
    await leave.save();
    await leave.populate('reviewer', 'firstName lastName');
    return toLeaveDto(leave);
  },

  async balances(employeeId: string): Promise<LeaveBalanceDto[]> {
    const employee = await employeeRepository.findById(employeeId);
    if (!employee) throw ApiError.notFound('Employee not found');

    const year = new Date().getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year, 11, 31));

    const [used, pending] = await Promise.all([
      leaveRepository.sumDaysByType(employeeId, LeaveStatus.Approved, yearStart, yearEnd),
      leaveRepository.sumDaysByType(employeeId, LeaveStatus.Pending, yearStart, yearEnd),
    ]);

    return LEAVE_TYPES.map((type) => {
      const entitlement = LEAVE_ENTITLEMENTS[type];
      const usedDays = used[type] ?? 0;
      return {
        type,
        entitlement,
        used: usedDays,
        pending: pending[type] ?? 0,
        remaining: Math.max(0, entitlement - usedDays),
      };
    });
  },
};
