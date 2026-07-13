import { useEffect, useState } from 'react';
import {
  Boxes,
  Briefcase,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export interface Kpi {
  key: string;
  label: string;
  value: number;
  format: 'currency' | 'number';
  deltaPct: number;
  icon: LucideIcon;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface CategorySlice {
  name: string;
  value: number;
  color: string;
}

export interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

export interface DashboardData {
  kpis: Kpi[];
  revenue: RevenuePoint[];
  categories: CategorySlice[];
  activity: ActivityEntry[];
}

/**
 * Representative sample data for the executive dashboard. Replaced by live
 * aggregation endpoints once the underlying modules land (Phase 12).
 */
const dashboardData: DashboardData = {
  kpis: [
    { key: 'revenue', label: 'Revenue (YTD)', value: 4_820_000, format: 'currency', deltaPct: 12.4, icon: DollarSign },
    { key: 'profit', label: 'Net Profit', value: 1_260_000, format: 'currency', deltaPct: 8.1, icon: TrendingUp },
    { key: 'expenses', label: 'Expenses', value: 3_560_000, format: 'currency', deltaPct: -3.2, icon: Wallet },
    { key: 'employees', label: 'Employees', value: 342, format: 'number', deltaPct: 4.5, icon: Users },
    { key: 'projects', label: 'Active Projects', value: 28, format: 'number', deltaPct: 6.0, icon: Briefcase },
    { key: 'inventory', label: 'Inventory Value', value: 1_140_000, format: 'currency', deltaPct: 2.3, icon: Boxes },
  ],
  revenue: [
    { month: 'Jan', revenue: 320_000, expenses: 240_000 },
    { month: 'Feb', revenue: 360_000, expenses: 250_000 },
    { month: 'Mar', revenue: 410_000, expenses: 280_000 },
    { month: 'Apr', revenue: 390_000, expenses: 300_000 },
    { month: 'May', revenue: 470_000, expenses: 310_000 },
    { month: 'Jun', revenue: 520_000, expenses: 340_000 },
    { month: 'Jul', revenue: 560_000, expenses: 360_000 },
  ],
  categories: [
    { name: 'Payroll', value: 1_640_000, color: '#4f46e5' },
    { name: 'Procurement', value: 920_000, color: '#0ea5e9' },
    { name: 'Operations', value: 600_000, color: '#22c55e' },
    { name: 'Marketing', value: 400_000, color: '#f59e0b' },
  ],
  activity: [
    { id: '1', actor: 'Hana Reyes', action: 'approved leave request for', target: 'Marcus Lee', time: '12m ago', tone: 'success' },
    { id: '2', actor: 'Procurement', action: 'raised purchase order', target: 'PO-2041', time: '48m ago', tone: 'primary' },
    { id: '3', actor: 'Finance', action: 'flagged expense report', target: 'EXP-1187', time: '2h ago', tone: 'warning' },
    { id: '4', actor: 'Ava Chen', action: 'closed deal', target: 'Northwind Ltd.', time: '3h ago', tone: 'success' },
    { id: '5', actor: 'System', action: 'onboarded new employee', target: 'Priya Nair', time: '5h ago', tone: 'info' },
  ],
};

/** Simulates an async load so the dashboard exercises real skeleton states. */
export function useDashboardData(): { data: DashboardData | null; isLoading: boolean } {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setData(dashboardData), 700);
    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading: data === null };
}
