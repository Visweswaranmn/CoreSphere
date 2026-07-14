export const LeaveType = {
  Annual: 'annual',
  Sick: 'sick',
  Casual: 'casual',
  Unpaid: 'unpaid',
} as const;
export type LeaveType = (typeof LeaveType)[keyof typeof LeaveType];
export const LEAVE_TYPES: readonly LeaveType[] = Object.values(LeaveType);
export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  [LeaveType.Annual]: 'Annual Leave',
  [LeaveType.Sick]: 'Sick Leave',
  [LeaveType.Casual]: 'Casual Leave',
  [LeaveType.Unpaid]: 'Unpaid Leave',
};

/** Annual entitlement (days) per leave type. Unpaid is unlimited (0 = untracked). */
export const LEAVE_ENTITLEMENTS: Record<LeaveType, number> = {
  [LeaveType.Annual]: 20,
  [LeaveType.Sick]: 10,
  [LeaveType.Casual]: 5,
  [LeaveType.Unpaid]: 0,
};

export const LeaveStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
} as const;
export type LeaveStatus = (typeof LeaveStatus)[keyof typeof LeaveStatus];
export const LEAVE_STATUSES: readonly LeaveStatus[] = Object.values(LeaveStatus);
export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  [LeaveStatus.Pending]: 'Pending',
  [LeaveStatus.Approved]: 'Approved',
  [LeaveStatus.Rejected]: 'Rejected',
  [LeaveStatus.Cancelled]: 'Cancelled',
};

export interface LeaveRequestDto {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  reviewerName?: string;
  decisionNote?: string;
  decidedAt?: string;
  createdAt: string;
}

export interface LeaveBalanceDto {
  type: LeaveType;
  entitlement: number;
  used: number;
  pending: number;
  remaining: number;
}
