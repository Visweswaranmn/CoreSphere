export const EmploymentType = {
  FullTime: 'full_time',
  PartTime: 'part_time',
  Contract: 'contract',
  Intern: 'intern',
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];
export const EMPLOYMENT_TYPES: readonly EmploymentType[] = Object.values(EmploymentType);
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  [EmploymentType.FullTime]: 'Full-time',
  [EmploymentType.PartTime]: 'Part-time',
  [EmploymentType.Contract]: 'Contract',
  [EmploymentType.Intern]: 'Intern',
};

export const EmployeeStatus = {
  Onboarding: 'onboarding',
  Active: 'active',
  OnLeave: 'on_leave',
  Terminated: 'terminated',
} as const;
export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];
export const EMPLOYEE_STATUSES: readonly EmployeeStatus[] = Object.values(EmployeeStatus);
export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  [EmployeeStatus.Onboarding]: 'Onboarding',
  [EmployeeStatus.Active]: 'Active',
  [EmployeeStatus.OnLeave]: 'On Leave',
  [EmployeeStatus.Terminated]: 'Terminated',
};

/** Allowed status transitions for the employee lifecycle workflow. */
export const EMPLOYEE_STATUS_TRANSITIONS: Record<EmployeeStatus, EmployeeStatus[]> = {
  [EmployeeStatus.Onboarding]: [EmployeeStatus.Active, EmployeeStatus.Terminated],
  [EmployeeStatus.Active]: [EmployeeStatus.OnLeave, EmployeeStatus.Terminated],
  [EmployeeStatus.OnLeave]: [EmployeeStatus.Active, EmployeeStatus.Terminated],
  [EmployeeStatus.Terminated]: [],
};

export interface EmployeeDto {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  department: string;
  jobTitle: string;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  dateOfJoining: string;
  location?: string;
  managerId?: string;
  managerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  onboarding: number;
  onLeave: number;
  byDepartment: { department: string; count: number }[];
}
