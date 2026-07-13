/** The eight application roles that drive access control across CoreSphere. */
export const Role = {
  SuperAdmin: 'super_admin',
  HrManager: 'hr_manager',
  FinanceManager: 'finance_manager',
  ProcurementManager: 'procurement_manager',
  InventoryManager: 'inventory_manager',
  SalesManager: 'sales_manager',
  ProjectManager: 'project_manager',
  Employee: 'employee',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** All roles as an array (useful for validation and select inputs). */
export const ROLES: readonly Role[] = Object.values(Role);

/** Human-readable labels for display in the UI. */
export const ROLE_LABELS: Record<Role, string> = {
  [Role.SuperAdmin]: 'Super Admin',
  [Role.HrManager]: 'HR Manager',
  [Role.FinanceManager]: 'Finance Manager',
  [Role.ProcurementManager]: 'Procurement Manager',
  [Role.InventoryManager]: 'Inventory Manager',
  [Role.SalesManager]: 'Sales Manager',
  [Role.ProjectManager]: 'Project Manager',
  [Role.Employee]: 'Employee',
};

/** Type guard narrowing an arbitrary string to a known {@link Role}. */
export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}
