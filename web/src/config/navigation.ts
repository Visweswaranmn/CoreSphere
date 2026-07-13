import {
  BarChart3,
  Banknote,
  Bell,
  Boxes,
  CalendarClock,
  CalendarX,
  Contact,
  FileBarChart,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Laptop,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { type Role, Role as Roles } from '@coresphere/shared';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Roles allowed to see this item. Empty = any authenticated user. */
  roles: Role[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [] }],
  },
  {
    label: 'Human Resources',
    items: [
      { label: 'Employees', path: '/hr/employees', icon: Users, roles: [Roles.HrManager] },
      { label: 'Attendance', path: '/hr/attendance', icon: CalendarClock, roles: [Roles.HrManager] },
      { label: 'Leave', path: '/hr/leave', icon: CalendarX, roles: [Roles.HrManager] },
      {
        label: 'Payroll',
        path: '/hr/payroll',
        icon: Wallet,
        roles: [Roles.HrManager, Roles.FinanceManager],
      },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Projects', path: '/projects', icon: FolderKanban, roles: [Roles.ProjectManager] },
      {
        label: 'Procurement',
        path: '/procurement',
        icon: ShoppingCart,
        roles: [Roles.ProcurementManager],
      },
      { label: 'Vendors', path: '/vendors', icon: Truck, roles: [Roles.ProcurementManager] },
      { label: 'Inventory', path: '/inventory', icon: Boxes, roles: [Roles.InventoryManager] },
      { label: 'Assets', path: '/assets', icon: Laptop, roles: [Roles.InventoryManager] },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { label: 'CRM', path: '/crm', icon: Contact, roles: [Roles.SalesManager] },
      { label: 'Sales', path: '/sales', icon: TrendingUp, roles: [Roles.SalesManager] },
      { label: 'Finance', path: '/finance', icon: Banknote, roles: [Roles.FinanceManager] },
    ],
  },
  {
    label: 'Workspace',
    items: [
      { label: 'Documents', path: '/documents', icon: FileText, roles: [] },
      { label: 'Reports', path: '/reports', icon: FileBarChart, roles: [] },
      { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: [] },
      { label: 'Notifications', path: '/notifications', icon: Bell, roles: [] },
    ],
  },
  {
    label: 'System',
    items: [{ label: 'Settings', path: '/settings', icon: Settings, roles: [Roles.SuperAdmin] }],
  },
];

/** True when the user's role may access an item (Super Admin sees everything). */
export function canAccess(role: Role, item: NavItem): boolean {
  return role === Roles.SuperAdmin || item.roles.length === 0 || item.roles.includes(role);
}

/** Returns only the nav groups/items visible to the given role. */
export function navigationForRole(role: Role): NavGroup[] {
  return navigation
    .map((group) => ({ ...group, items: group.items.filter((item) => canAccess(role, item)) }))
    .filter((group) => group.items.length > 0);
}
