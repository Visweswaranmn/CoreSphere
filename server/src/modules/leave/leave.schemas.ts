import { z } from 'zod';
import { LeaveStatus, LeaveType } from '@coresphere/shared';
import { paginationQuerySchema } from '../../utils/pagination';
import { objectId } from '../employees/employee.schemas';

export const createLeaveSchema = z
  .object({
    employeeId: objectId,
    type: z.nativeEnum(LeaveType),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    reason: z.string().trim().min(1, 'A reason is required').max(500),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

export const decideLeaveSchema = z.object({
  status: z
    .nativeEnum(LeaveStatus)
    .refine((s) => s === LeaveStatus.Approved || s === LeaveStatus.Rejected, {
      message: 'Decision must be approve or reject',
    }),
  note: z.string().trim().max(500).optional(),
});

export const listLeaveQuerySchema = paginationQuerySchema.extend({
  employeeId: objectId.optional(),
  status: z.nativeEnum(LeaveStatus).optional(),
});

export const balanceQuerySchema = z.object({
  employeeId: objectId,
});

export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type DecideLeaveInput = z.infer<typeof decideLeaveSchema>;
export type ListLeaveQuery = z.infer<typeof listLeaveQuerySchema>;
export type BalanceQuery = z.infer<typeof balanceQuerySchema>;
