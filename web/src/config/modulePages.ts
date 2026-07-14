import {
  BarChart3,
  Banknote,
  Bell,
  Boxes,
  Contact,
  FileBarChart,
  FileText,
  Laptop,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { type Role, Role as Roles } from '@coresphere/shared';

export interface ModulePage {
  path: string;
  title: string;
  description: string;
  icon: LucideIcon;
  phase: string;
  roles: Role[];
}

/** Not-yet-built module routes. Kept in sync with the sidebar navigation. */
export const modulePages: ModulePage[] = [
  { path: '/procurement', title: 'Procurement', description: 'Purchase requests and approval workflows.', icon: ShoppingCart, phase: 'Phase 7', roles: [Roles.ProcurementManager] },
  { path: '/vendors', title: 'Vendors', description: 'Vendor directory and approval.', icon: Truck, phase: 'Phase 7', roles: [Roles.ProcurementManager] },
  { path: '/inventory', title: 'Inventory', description: 'Stock levels, movements, and warehouses.', icon: Boxes, phase: 'Phase 8', roles: [Roles.InventoryManager] },
  { path: '/assets', title: 'Asset Management', description: 'Company asset register and assignments.', icon: Laptop, phase: 'Phase 8', roles: [Roles.InventoryManager] },
  { path: '/crm', title: 'CRM', description: 'Customer accounts and relationships.', icon: Contact, phase: 'Phase 9', roles: [Roles.SalesManager] },
  { path: '/sales', title: 'Sales', description: 'Sales pipeline and orders.', icon: TrendingUp, phase: 'Phase 9', roles: [Roles.SalesManager] },
  { path: '/finance', title: 'Finance', description: 'Accounts, expenses, and budgets.', icon: Banknote, phase: 'Phase 10', roles: [Roles.FinanceManager] },
  { path: '/documents', title: 'Documents', description: 'Centralized document management.', icon: FileText, phase: 'Phase 11', roles: [] },
  { path: '/notifications', title: 'Notifications', description: 'System and workflow notifications.', icon: Bell, phase: 'Phase 11', roles: [] },
  { path: '/reports', title: 'Reports', description: 'Operational and financial reporting.', icon: FileBarChart, phase: 'Phase 12', roles: [] },
  { path: '/analytics', title: 'Analytics', description: 'Cross-module analytics and insights.', icon: BarChart3, phase: 'Phase 12', roles: [] },
  { path: '/settings', title: 'System Settings', description: 'Organization and platform configuration.', icon: Settings, phase: 'Phase 13', roles: [Roles.SuperAdmin] },
];
